import PropertyTrigger from "./PropertyTrigger";
import { Property } from "../Property";

/**
 * A trigger which activates when a property is equal to a given value
 */
export default class EqualityTrigger extends PropertyTrigger {
  value: number;

  /**
   *
   * @param label
   * @param property
   * @param value
   */
  constructor(label: string, property: Property, value: number) {
    super(label, property);

    this.value = value;
  }

  /**
   * Creates a trigger from a given object
   * @param {any} desc
   */
  static fromDescription(desc: any) {
    if (!desc.hasOwnProperty("value")) {
      throw new Error("Value property missing from object.");
    }
    if (!desc.hasOwnProperty("property")) {
      throw new Error("Property description missing from object.");
    }
    return new this(desc.label, Property.fromDescription(desc.property), parseInt(desc.value));
  }

  /**
   * Creates a JSON object from a equality trigger instance
   * @return {Object}
   */
  toDescription(): Object {
    return Object.assign(
      super.toDescription(),
      {
        value: this.value,
      }
    );
  }

  /**
   * @param {number} propValue
   */
  onValueChanged(propValue: number) {
    const on = propValue === this.value;
    this.emit("stateChanged", { on, value: propValue });
  }
}