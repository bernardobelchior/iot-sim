import { Property } from '../../api/models/Property';
import { Effect } from './Effect';

export interface IPropertyEffect {
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
    let p = desc.property;
    this.property = new Property(p.id, p.title, p.description, p.type);
    if(p.metadata !== undefined) {
      this.property.defineMetadata(p.metadata);
    }
  }

  /**
   * @return {IPropertyEffect}
   */
  toDescription() {
    return Object.assign(super.toDescription(), {
      property: this.property.asPropertyDescription(),
    });
  }
}