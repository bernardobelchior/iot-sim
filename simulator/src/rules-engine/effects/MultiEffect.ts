import { Effect } from './Effect';
import fromDescription, { State } from '.';

export interface IMultiEffect {
  type: string;
  label: string;
  effects: Effect[];
}

/**
 * MultiEffect - The outcome of a Rule involving multiple effects
 */
export class MultiEffect extends Effect {
  effects: Effect[]
  /**
   * @param {MultiEffectDescription} desc
   */
  constructor(desc: IMultiEffect) {
    super(desc);

    this.effects = desc.effects.map(function(effect) {
      return fromDescription(effect);
    });
  }

  /**
   * @return {IMultiEffect}
   */
  toDescription() {
    return Object.assign(super.toDescription(), {
      effects: this.effects.map((effect) => effect.toDescription()),
    });
  }

  /**
   * @param {State} state
   */
  setState(state: State) {
    for (const effect of this.effects) {
      effect.setState(state);
    }
  }
}
