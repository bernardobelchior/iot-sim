import { effects } from "./effects";
import { triggers } from "./triggers";
import Events from "./Events";
import { Effect } from "./effects/Effect";
import { Trigger } from "./triggers/Trigger";

export default class Rule {
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
    const trigger = triggers.fromDescription(desc.trigger);
    const effect = effects.fromDescription(desc.effect);
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
    this.trigger.on(Events.STATE_CHANGED, this.onTriggerStateChanged);
    await this.trigger.start();
  }

  /**
   * On a state changed event, pass the state forward to the rule's effect
   * @param {boolean} state
   */
  onTriggerStateChanged(state: boolean) {
    if (!this.enabled) {
      return;
    }
    this.effect.setState(state);
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
    this.trigger.removeListener(
      Events.STATE_CHANGED,
      this.onTriggerStateChanged
    );
    this.trigger.stop();
  }
}