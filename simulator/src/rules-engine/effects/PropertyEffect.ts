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
   * @return {any}
   */
  toDescription(): any {
    return Object.assign(super.toDescription(), {
      property: this.property.asPropertyDescription(),
    });
  }
}