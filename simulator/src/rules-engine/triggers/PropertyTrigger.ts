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
   * Creates a JSON object from a property trigger instance
   * @return {Object}
   */
  toDescription(): Object {
    return Object.assign(super.toDescription(), { property: this.property.toDescription() });
  }

  async start() {
    this.property.on("valueChanged", this.onValueChanged);
  }

  stop() {
    this.property.removeListener("valueChanged", this.onValueChanged);
  }

  onValueChanged(_value: any) {}

  /**
   * Get the subscriptions necessary for the trigger to activate when the condition is met
   * When the trigger uses a property, the subscription is made to the respective thing property
   */
  getSubscriptions(): string | string[] {
    return `things/${this.property.thing}/properties/${this.property.id}`;
  }

  /**
   * Check if the conditions are met to activate the trigger
   * @param topic
   * @param data
   */
  update(topic: string, data: any) {
    const sub = this.getSubscriptions() as string;
    if (sub === topic) {
      const levels = topic.split("/");
      const thing = levels[1];
      const property = levels[3];
      const keys = Object.keys(data);
      if (keys[0] !== property) {
        return;
      }
      this.property.onPropertyChanged(thing, property, data[keys[0]]);
    }
  }
}
