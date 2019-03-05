import { Effect, IEffect } from "./Effect";
import { ActionEffect } from "./ActionEffect";
import { MultiEffect } from "./MultiEffect";
import { NotificationEffect } from "./NotificationEffect";
import { SetEffect } from "./SetEffect";
import { PulseEffect } from "./PulseEffect";

export const effects: any = {
  Effect,
  ActionEffect,
  MultiEffect,
  NotificationEffect,
  SetEffect,
  PulseEffect
};

/**
 * Produce an effect from a serialized effect description. Throws if `desc` is
 * invalid
 * @param {EffectDescription} desc
 * @return {Effect}
 */
export const fromDescription = (desc: IEffect): Effect => {
  const EffectClass = effects[desc.type];
  if (!EffectClass) {
    throw new Error(`Unsupported or invalid effect type:${desc.type}`);
  }
  return new EffectClass(desc);
};