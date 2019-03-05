import { EventEmitter } from "events";

export interface ITrigger {
  type: string;
  label: string;
}

/**
 * The trigger component of a Rule which monitors some state and passes on
 * whether to be active to the Rule's effect
 */
export class Trigger extends EventEmitter {
  type: string;
  label: string;
  /**
   * Create a Trigger based on a wire-format description with a property
   * @param {ITrigger} desc
   */
  constructor(desc: ITrigger) {
    super();
    this.type = this.constructor.name;
    this.label = desc.label;
  }

  /**
   * @return {ITrigger}
   */
  toDescription(): ITrigger {
    return {
      type: this.type,
      label: this.label,
    };
  }
}