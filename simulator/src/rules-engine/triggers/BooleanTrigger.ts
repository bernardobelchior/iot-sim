import assert from "assert";
import PropertyTrigger from "./PropertyTrigger";
import { Property } from "../Property";

/**
 * A Trigger which activates when a boolean property is
 * equal to a given value, `onValue`
 */
export default class BooleanTrigger extends PropertyTrigger {
  onValue: boolean;

  /**
   *
   * @param label
   * @param property
   * @param onValue
   */
  constructor(label: string, property: Property, onValue: boolean) {
    super(label, property);
    assert(this.property.type === "boolean");
    assert(typeof onValue === "boolean");
    this.onValue = onValue;
  }

  /**
   * @return {any}
   */
  toDescription(): any {
    return Object.assign(super.toDescription(), { onValue: this.onValue });
  }

  /**
   * @param {boolean} propValue
   */
  onValueChanged(propValue: boolean) {
    if (propValue === this.onValue) {
      this.emit("stateChanged", { on: true, value: propValue });
    } else {
      this.emit("stateChanged", { on: false, value: propValue });
    }
  }
}
