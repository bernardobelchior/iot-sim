import { Thing } from "./models/Thing";
import { MessageQueue } from "./MessageQueue";
import { parseWebThing, builder } from "./builder";

type ThingMap = { [id: string]: Thing };

export const REGISTER_TOPIC = "__register";

export class DeviceRegistry {
  static getThing(thingId: string): any {
    throw new Error("Method not implemented.");
  }
  static setThingProperty(thing: string, id: string, value: any): any {
    throw new Error("Method not implemented.");
  }
  static getThingProperty(thing: string, id: string): any {
    throw new Error("Method not implemented.");
  }
  private simulatedThings: ThingMap = {};
  private things: ThingMap = {};
  private messageQueue: MessageQueue;

  constructor(messageQueue: MessageQueue) {
    this.messageQueue = messageQueue;
  }

  initFromConfig() {
    builder().things.forEach(t => (this.things[t.id] = t));

    return this.init();
  }

  /**
   * Subscribes to the message queue. If this is not called, then messages
   * published to the message queue will not be consumed.
   */
  init() {
    return this.messageQueue.subscribe(REGISTER_TOPIC, this.consume.bind(this));
  }

  getSimulatedThings(): ThingMap {
    return this.simulatedThings;
  }

  getPhysicalThings(): ThingMap {
    return this.things;
  }

  getThings(): ThingMap {
    return { ...this.things, ...this.simulatedThings };
  }

  getThing(id: string): Thing | undefined {
    return this.getThings()[id];
  }

  addThing(thing: Thing) {
    if (thing.isSimulated()) {
      this.simulatedThings[thing.id] = thing;
    } else {
      this.things[thing.id] = thing;
    }

    return this.messageQueue.subscribe(thing.href, this.consume.bind(this));
  }

  private consume(topic: string, msg: Buffer) {
    switch (topic) {
      case REGISTER_TOPIC:
        this.handleRegistry(topic, msg);
        break;
      default:
        this.handleWebSocketMessage(topic, msg);
        break;
    }
  }

  private handleRegistry(_topic: string, msg: Buffer) {
    const obj = JSON.parse(msg.toString());

    const thing = parseWebThing(obj);

    return this.addThing(thing);
  }

  private handleWebSocketMessage(topic: string, msg: Buffer) {
    const id = Thing.generateIdFromHref(topic);

    const obj: any = JSON.parse(msg.toString());

    switch (obj.messageType) {
      case "setProperty":
      case "propertyStatus":
        const thing = this.getThing(id);

        if (thing !== undefined) {
          thing.setProperties(obj.data);
        }

        break;
      default:
        break;
    }
  }
}
