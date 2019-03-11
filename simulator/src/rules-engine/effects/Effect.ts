/**
 * Effect - The outcome of a Rule once triggered
 */
export default class Effect {
  type: string;
  label: string;

  /**
   * Create an Effect based on a wire-format description with a property
   * @param {IEffect} desc
   */
  constructor(label: string) {
    this.type = this.constructor.name;
    this.label = label;
  }

  /**
   * @return {any}
   */
  toDescription(): any {
    return {
      type: this.type,
      label: this.label,
    };
  }

  /**
   * Set the state of Effect based on a trigger
   * @param {boolean} _state
   */
  setState(_state: boolean) {
    throw new Error("Unimplemented");
  }
}