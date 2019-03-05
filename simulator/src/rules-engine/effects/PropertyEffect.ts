import { Property } from "../Property";
import { Effect } from "./Effect";

interface IPropertyEffect {
  type: string;
  label: string;
  property: Property;
}

/**
 * PropertyEffect - The outcome of a Rule involving a property
 */
export class PropertyEffect extends Effect {
  property: Property;

  /**
   * Create an Effect based on a wire-format description with a property
   * @param {IPropertyEffect} desc
   */
  constructor(desc: IPropertyEffect) {
    super(desc);
    this.property = new Property(desc.property);
  }

  /**
   * @return {IPropertyEffect}
   */
  toDescription(): IPropertyEffect {
    return Object.assign(super.toDescription(), {
      property: this.property.asPropertyDescription(),
    });
  }
}