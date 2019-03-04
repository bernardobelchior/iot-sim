import { Property } from '../../api/models/Property';
import { Effect } from './Effect';
import { effects } from '.';

export interface EffectDescription {
  type: string;
  label: string;
}

export interface PropertyEffectDescription {
  type: string;
  label: string;
  property: Property;
}

export interface MultiEffectDescription {
  type: string;
  label: string;
  effects: Effect[];
}

export interface NotificationEffectDescription {
  type: string;
  label: string;
  message: string;
}

export interface State {
  on: boolean;
  off: boolean;
}

/**
 * Produce an effect from a serialized effect description. Throws if `desc` is
 * invalid
 * @param {EffectDescription} desc
 * @return {Effect}
 */
const fromDescription = (desc: EffectDescription): Effect => {
  const EffectClass = effects[desc.type];
  if (!EffectClass) {
    throw new Error(`Unsupported or invalid effect type:${desc.type}`);
  }
  return new EffectClass(desc);
}
export default fromDescription;