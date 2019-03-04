import { Property } from '../../api/models/Property';
import assert from 'assert';
import { PropertyEffect } from './PropertyEffect';
import { State } from '.';

export interface IPulseEffect {
  type: string;
  label: string;
  property: Property;
  value: any;
  oldValue: any;
  on: boolean;
}

/**
 * An Effect which temporarily sets the target property to
 * a value before restoring its original value
 */
export class PulseEffect extends PropertyEffect {
  value: any;
  oldValue: any = undefined;
  on: boolean = false;

  /**
   * @param {IPulseEffect} desc
   */
  constructor(desc: IPulseEffect) {
    super(desc);
    this.value = desc.value;
    assert(typeof this.value === this.property.type, 'setpoint and property must be same type');
  }

  /**
   * @return {EffectDescription}
   */
  toDescription() {
    return Object.assign(
      super.toDescription(),
      {value: this.value}
    );
  }

  /**
   * @param {State} state
   */
  setState(state: State) {
    if (state.on) {
      // If we're already active, just perform the effect again
      if (this.on) {
        return this.property.setValue(this.value);
      }
      // Activate the effect and save our current state to revert to upon
      // deactivation
      this.property.getValue().then((value) => {
        if (value !== this.value) {
          this.oldValue = value;
        } else {
          this.oldValue = null;
        }
        this.on = true;
        return this.property.set(this.value);
      });
    } else if (this.on) {
      // Revert to our original value if we pulsed to a new value
      this.on = false;
      if (this.oldValue !== null) {
        return this.property.set(this.oldValue);
      }
    }
  }
}