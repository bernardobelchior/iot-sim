import Trigger from "./Trigger";
import { Property } from "../Property";

/**
 * An abstract class for triggers whose input is a single property
 */
export default class PropertyTrigger extends Trigger {
  property: Property;

  /**
   *
   * @param {string} label
   * @param {Property} property
   */
  constructor(label: string, property: Property) {
    super(label);
    this.property = property;
    this.onValueChanged = this.onValueChanged.bind(this);
  }

  /**
   * @return {any}
   */
  toDescription(): any {
    return Object.assign(super.toDescription(), { property: this.property.toDescription() });
  }

  async start() {
    this.property.on("valueChanged", this.onValueChanged);
    await this.property.start();
  }

  onValueChanged(_value: any) {}

  stop() {
    this.property.removeListener("valueChanged", this.onValueChanged);
    this.property.stop();
  }
}
