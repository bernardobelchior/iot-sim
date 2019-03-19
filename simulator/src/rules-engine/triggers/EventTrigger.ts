import Trigger from "./Trigger";
import { SimulatorSingleton } from "../../Simulator";

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
   * Creates a JSON object from a event trigger instance
   * @return {Object}
   */
  toDescription(): object {
    return Object.assign(super.toDescription(), {
      thingId: this.thingId,
      event: this.event,
      stopped: this.stopped
    });
  }

  async start() {
    this.stopped = false;
    const registry = SimulatorSingleton.getRegistry();
    const thing = registry.getThing(this.thingId);
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
    const registry = SimulatorSingleton.getRegistry();
    const thing = registry.getThing(this.thingId);
    thing.removeEventSubscription(this.onEvent);
  }
}
