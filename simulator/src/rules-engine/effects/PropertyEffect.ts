import { Property } from '../../api/models/Property';
import { Effect } from './Effect';
import { PropertyEffectDescription } from './util';


/**
 * PropertyEffect - The outcome of a Rule involving a property
 */
export class PropertyEffect extends Effect {
  property: Property;

  /**
   * Create an Effect based on a wire-format description with a property
   * @param {PropertyEffectDescription} desc
   */
  constructor(desc: PropertyEffectDescription) {
    super(desc);
    this.property = new Property(desc.property);
  }

  /**
   * @return {EffectDescription}
   */
  toDescription() {
    return Object.assign(super.toDescription(), {
      property: this.property.asPropertyDescription(),
    });
  }
}