import Trigger from "./Trigger";
import { DeviceRegistrySingleton } from "../../api/DeviceRegistry";

/**
 * A trigger activated when an event occurs
 */
export default class EventTrigger extends Trigger {
  thingId: string;
  event: string;
  stopped: boolean = true;

  constructor(label: string, thingId: string, event: string) {
    super(label);
    (this.thingId = thingId), (this.event = event);
    this.onEvent = this.onEvent.bind(this);
  }

  /**
   * Creates a trigger from a given object
   * @param {any} desc
   */
  static fromDescription(desc: any) {
    if (!desc.hasOwnProperty("thingId")) {
      throw new Error("ThingId property missing from object.");
    }
    if (!desc.hasOwnProperty("event")) {
      throw new Error("Event property missing from object.");
    }
    return new this(desc.label, desc.thingId, desc.event);
  }

  /**
   * @return {any}
   */
  toDescription(): any {
    return Object.assign(super.toDescription(), {
      thingId: this.thingId,
      event: this.event,
      stopped: this.stopped
    });
  }

  async start() {
    this.stopped = false;
    const thing = DeviceRegistrySingleton.getThing(this.thingId);
    if (this.stopped) {
      return;
    }
    thing.addEventSubscription(this.onEvent);
  }

  onEvent(eventName: string) {
    if (this.event !== eventName) {
      return;
    }

    this.emit("stateChanged", { on: true, value: Date.now() });
    this.emit("stateChanged", { on: false, value: Date.now() });
  }

  stop() {
    this.stopped = true;
    const thing = DeviceRegistrySingleton.getThing(this.thingId);
    thing.removeEventSubscription(this.onEvent);
  }
}
