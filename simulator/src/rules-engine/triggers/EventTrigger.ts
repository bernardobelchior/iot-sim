import Trigger from "./Trigger";

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
  }

  onEvent(eventName: string) {
    if (this.event !== eventName || this.stopped) {
      return;
    }

    this.emit("stateChanged", { on: true, value: Date.now() });
    this.emit("stateChanged", { on: false, value: Date.now() });
  }

  async stop() {
    this.stopped = true;
  }

  /**
   * Get the subscriptions necessary for the trigger to activate when the condition is met
   * When the trigger uses an event, the subscription is made to the respective thingId event
   */
  getSubscriptions(): string | string[] {
    return `things/${this.thingId}/events/${this.event}`;
  }

  /**
   * Check if the conditions are met to activate the trigger
   * @param topic
   * @param data
   */
  update(topic: string, data: any) {
    const sub = this.getSubscriptions() as string;
    if (sub === topic) {
      const levels = topic.split("/");
      const event = levels[3];

      this.onEvent(event);
    }
  }
}
