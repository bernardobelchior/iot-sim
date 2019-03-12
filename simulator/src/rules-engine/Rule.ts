import { fromDescription as eFromDescription } from "./effects";
import { fromDescription as tFromDescription } from "./triggers";
import { TriggerEmitter } from "./Events";
import Effect from "./effects/Effect";
import Trigger from "./triggers/Trigger";
import { EventEmitter } from "events";

export default class Rule extends (EventEmitter as { new (): TriggerEmitter }) {
  effect: Effect;
  trigger: Trigger;
  enabled: boolean;
  id?: string;
  name?: string;

  /**
   * @param {boolean} enabled
   * @param {Trigger} trigger
   * @param {Effect} effect
   */
  constructor(enabled: boolean, trigger: Trigger, effect: Effect) {
    super();
    this.enabled = enabled;
    this.trigger = trigger;
    this.effect = effect;

    this.onTriggerStateChanged = this.onTriggerStateChanged.bind(this);
  }

  /**
   * Create a rule from a serialized description
   * @param {any} desc
   * @return {Rule}
   */
  static fromDescription(desc: any): Rule {
    const trigger = tFromDescription(desc.trigger);
    const effect = eFromDescription(desc.effect);
    const rule = new this(desc.enabled, trigger, effect);
    if (desc.hasOwnProperty("id")) {
      rule.id = desc.id;
    }
    if (desc.hasOwnProperty("name")) {
      rule.name = desc.name;
    }
    return rule;
  }

  /**
   * Begin executing the rule
   */
  async start() {
    this.trigger.on("stateChanged", this.onTriggerStateChanged);
    await this.trigger.start();
  }

  /**
   * On a state changed event, pass the state forward to the rule's effect
   * @param {any} state
   */
  onTriggerStateChanged(state: { on: boolean; value?: any }) {
    if (!this.enabled) {
      return;
    }
    this.effect.setState(state.on);
  }

  /**
   * @return {any}
   */
  toDescription() {
    const desc: any = {
      enabled: this.enabled,
      trigger: this.trigger.toDescription(),
      effect: this.effect.toDescription()
    };
    if (this.hasOwnProperty("id")) {
      desc.id = this.id;
    }
    if (this.hasOwnProperty("name")) {
      desc.name = this.name;
    }
    return desc;
  }

  /**
   * Stop executing the rule
   */
  stop() {
    this.trigger.removeListener("stateChanged", this.onTriggerStateChanged);
    this.trigger.stop();
  }
}