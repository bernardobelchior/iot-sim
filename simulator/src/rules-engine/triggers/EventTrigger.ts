import Trigger from "./Trigger";
import Engine from "../Engine";
import { Thing } from "../../api/models/Thing";

/**
 * A trigger activated when an event occurs
 */
export default class EventTrigger extends Trigger {
  thingId: string;
  event: string;
  stopped: boolean = true;

  constructor(label: string, thingId: string, event: string) {
    super(label);
    this.thingId = thingId,
    this.event = event;
    this.onEvent = this.onEvent.bind(this);
  }

  /**
   * @return {any}
   */
  toDescription(): any {
    return Object.assign(
      super.toDescription(),
      {
        thingId: this.thingId,
        event: this.event,
        stopped: this.stopped
      }
    );
  }

  async start() {
    this.stopped = false;
    const thing = await Engine.getThing(this.thingId);
    if (this.stopped) {
      return;
    }
    thing.addEventSubscription(this.onEvent);
  }

  onEvent(eventName: string) {
    if (this.event !== eventName) {
      return;
    }

    this.emit("stateChanged", {on: true, value: Date.now()});
    this.emit("stateChanged", {on: false, value: Date.now()});
  }

  stop() {
    this.stopped = true;
    Engine.getThing(this.thingId).then((thing: Thing) => {
      thing.removeEventSubscription(this.onEvent);
    });
  }
}
