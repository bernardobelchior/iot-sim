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
   * @return {any}
   */
  toDescription(): any {
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
    this.emit("stateChanged", {on: on, value: propValue});
  }
}