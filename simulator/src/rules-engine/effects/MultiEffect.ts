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
  /**
   * Creates an effect from a given object
   * @param {any} desc
   */
  static fromDescription(desc: any) {
    if (!desc.hasOwnProperty("label")) {
      throw new Error("Label property missing from object.");
    }
    if (!desc.hasOwnProperty("effects")) {
      throw new Error("Effects property missing from object.");
    }
    const effects: Effect[] = desc.effects.map((e: any) => Effect.fromDescription(e));
    return new this(desc.label, effects);
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
