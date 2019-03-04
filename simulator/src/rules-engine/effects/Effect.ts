import { State } from '.';

export interface IEffect {
  type: string;
  label: string;
}

/**
 * Effect - The outcome of a Rule once triggered
 */
export class Effect {
  type: string;
  label: string;

  /**
   * Create an Effect based on a wire-format description with a property
   * @param {IEffect} desc
   */
  constructor(desc: IEffect) {
    this.type = this.constructor.name;
    this.label = desc.label;
  }

  /**
   * @return {IEffect}
   */
  toDescription() {
    return {
      type: this.type,
      label: this.label,
    };
  }

  /**
   * Set the state of Effect based on a trigger
   * @param {State} _state
   */
  setState(_state: State) {
    throw new Error('Unimplemented');
  }
}