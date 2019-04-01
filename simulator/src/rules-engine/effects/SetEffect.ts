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
    const p = new Property(
      desc.property.type,
      desc.property.id,
      desc.property.thing,
      desc.property.unit,
      desc.property.description
    );
    return new this(desc.label, p, desc.value);
  }

  /**
   * Creates a JSON object from a set effect instance
   * @return {Object}
   */
  toDescription(): Object {
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
    return;
  }
}
