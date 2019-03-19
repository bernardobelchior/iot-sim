import { Property } from "../Property";
import Effect from "./Effect";

/**
 * PropertyEffect - The outcome of a Rule involving a property
 */
export default class PropertyEffect extends Effect {
  property: Property;

  /**
   *
   * @param label
   * @param property
   */
  constructor(label: string, property: Property) {
    super(label);
    this.property = property;
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
    const p = new Property(desc.property.type, desc.property.id, desc.property.thing, desc.property.unit, desc.property.description);
    return new this(desc.label, p);
  }

  /**
   * Creates a JSON object from a property effect instance
   * @return {Object}
   */
  toDescription(): Object {
    return Object.assign(super.toDescription(), {
      property: this.property.toDescription(),
    });
  }
}