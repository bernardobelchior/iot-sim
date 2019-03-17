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
   * Creates a trigger from a given object
   * @param {any} desc
   */
  static fromDescription(desc: any) {
    if (!desc.hasOwnProperty("property")) {
      throw new Error("Property description missing from object.");
    }
    return new this(desc.label, Property.fromDescription(desc.property));
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
