import Effect from "./Effect";

/**
 * MultiEffect - The outcome of a Rule involving multiple effects
 */
export default class MultiEffect extends Effect {
  effects: Effect[];
  /**
   * @param {MultiEffectDescription} desc
   */
  constructor(label: string, effects: Effect[]) {
    super(label);
    this.effects = effects;
  }

  static fromDescription() {

  }

  /**
   * @return
   */
  toDescription() {
    return Object.assign(super.toDescription(), {
      effects: this.effects.map((effect) => effect.toDescription()),
    });
  }

  /**
   * @param {boolean} state
   */
  setState(state: boolean) {
    for (const effect of this.effects) {
      effect.setState(state);
    }
  }
}
