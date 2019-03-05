import { ITrigger, Trigger } from "./Trigger";

export const triggers: any = {
  BooleanTrigger,
  EqualityTrigger,
  EventTrigger,
  LevelTrigger,
  MultiTrigger,
  PropertyTrigger,
  TimeTrigger,
  Trigger,
};

/**
 * Produce an trigger from a serialized trigger description. Throws if `desc`
 * is invalid
 * @param {ITrigger} desc
 * @return {Trigger}
 */
export function fromDescription(desc: ITrigger): Trigger {
  const TriggerClass = triggers[desc.type];
  if (!TriggerClass) {
    throw new Error(`Unsupported or invalid trigger type:${desc.type}`);
  }
  return new TriggerClass(desc);
}