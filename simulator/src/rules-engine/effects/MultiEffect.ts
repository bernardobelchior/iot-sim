import { Effect } from './Effect';
import fromDescription, { MultiEffectDescription, State } from './util';

/**
 * MultiEffect - The outcome of a Rule involving multiple effects
 */
export class MultiEffect extends Effect {
  effects: Effect[]
  /**
   * @param {MultiEffectDescription} desc
   */
  constructor(desc: MultiEffectDescription) {
    super(desc);

    this.effects = desc.effects.map(function(effect) {
      return fromDescription(effect);
    });
  }

  /**
   * @return {EffectDescription}
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
