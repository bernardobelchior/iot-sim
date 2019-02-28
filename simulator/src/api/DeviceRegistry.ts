import { Thing } from "./models/Thing";
import { MessageQueue } from "./MessageQueue";
import { parseWebThing, builder } from "./builder";

export class DeviceRegistry {
  private things: Thing[] = [];
  private messageQueue: MessageQueue;

  constructor(messageQueue: MessageQueue) {
    this.messageQueue = messageQueue;
  }

  initFromConfig() {
    this.things = [...builder().things];

    return this.init();
  }

  init() {
    return this.messageQueue.subscribe("register", this.consume.bind(this));
  }

  getThings() {
    return this.things;
  }

  getThing(thingId: string) {
    return this.things.find((x: Thing) => x.name === thingId);
  }

  private consume(topic: string, msg: Buffer) {
    if (msg !== null) {
      const obj = JSON.parse(msg.toString());

      this.things.push(parseWebThing(obj));
    }
  }
}
