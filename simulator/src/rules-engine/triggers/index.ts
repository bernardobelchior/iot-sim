import BooleanTrigger from "./BooleanTrigger";
import EqualityTrigger from "./EqualityTrigger";
import EventTrigger from "./EventTrigger";
import LevelTrigger from "./LevelTrigger";
import MultiTrigger from "./MultiTrigger";
import PropertyTrigger from "./PropertyTrigger";
import TimeTrigger from "./TimeTrigger";
import Trigger from "./Trigger";

const triggers: any = {
  BooleanTrigger,
  EqualityTrigger,
  EventTrigger,
  LevelTrigger,
  MultiTrigger,
  PropertyTrigger,
  TimeTrigger,
  Trigger
};

/**
 * Produce an effect from a serialized effect description. Throws if `desc` is
 * invalid
 * @param {any} desc
 * @return {Effect}
 */
function fromDescription(desc: any): Trigger {
  const TriggerClass = triggers[desc.type];
  if (!TriggerClass) {
    throw new Error(`Unsupported or invalid trigger type:${desc.type}`);
  }
  return TriggerClass.fromDescription(desc);
}

export {
  BooleanTrigger,
  EqualityTrigger,
  EventTrigger,
  LevelTrigger,
  MultiTrigger,
  PropertyTrigger,
  TimeTrigger,
  Trigger,
  fromDescription
};
