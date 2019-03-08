import StrictEventEmitter from "strict-event-emitter-types";
import { EventEmitter } from "events";

export interface Events {
  stateChanged: (payload: { on: boolean; value?: any }) => void;
  initRule: (state: boolean) => void;
  valueChanged: (value: any) => void;
}

export type TriggerEmitter = StrictEventEmitter<EventEmitter, Events>;
