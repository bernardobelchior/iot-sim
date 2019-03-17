import { Property } from "../Property";
import assert from "assert";
import PropertyEffect from "./PropertyEffect";

/**
 * An Effect which temporarily sets the target property to
 * a value before restoring its original value
 */
export default class PulseEffect extends PropertyEffect {
  value: any;
  oldValue: any = undefined;
  on: boolean = false;

  /**
   *
   * @param label
   * @param property
   * @param value
   */
  constructor(label: string, property: Property, value: any) {
    super(label, property);
    this.value = value;
    assert(typeof this.value === this.property.type, "set point and property must be same type");
  }

 /**
   * Creates an effect from a given object
   * @param {any} desc
   */
  static fromDescription(desc: any) {
    if (!desc.hasOwnProperty("label")) {
      throw new Error("Label property missing from object.");
    }
    if (!desc.hasOwnProperty("property")) {
      throw new Error("Property missing from object.");
    }
    if (!desc.hasOwnProperty("value")) {
      throw new Error("Value missing from object.");
    }
    const p = new Property(desc.property.type, desc.property.id, desc.property.thing, desc.property.unit, desc.property.description);
    return new this(desc.label, p, desc.value);
  }

  /**
   * @return {any}
   */
  toDescription(): any {
    return Object.assign(
      super.toDescription(),
      { value: this.value, on: this.on }
    );
  }

  /**
   * @param {boolean} state
   */
  setState(state: boolean) {
     if (state) {
      // If we're already active, just perform the effect again
      if (this.on) {
        return this.property.set(this.value);
      }
      // Activate the effect and save our current state to revert to upon
      // deactivation
      this.property.get().then((value) => {
        if (value !== this.value) {
          this.oldValue = value;
        } else {
          this.oldValue = undefined;
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
    return Promise.resolve();
  }
}