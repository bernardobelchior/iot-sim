import assert from "assert";
import PropertyEffect from "./PropertyEffect";
import { Property } from "../Property";

/**
 * An Effect which permanently sets the target property to
 * a value when triggered
 */
export default class SetEffect extends PropertyEffect {
  value: any;
  on: boolean = false;

  constructor(label: string, property: Property, value: any) {
    super(label, property);
    this.value = value;
    assert(
      typeof this.value === this.property.type,
      "set point and property must be same type"
    );
  }

  /**
   * @return {any}
   */
  toDescription(): any {
    return Object.assign(super.toDescription(), {
      value: this.value,
      on: this.on
    });
  }

  /**
   * @param {boolean} state
   */
  setState(state: boolean) {
    if (!this.on && state) {
      this.on = true;
      return this.property.set(this.value);
    }
    if (this.on && !state) {
      this.on = false;
    }
    return Promise.resolve();
  }
}
