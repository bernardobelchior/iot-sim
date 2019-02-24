import { Thing } from "./controllers/thing";
import { MessageQueue } from "./MessageQueue";
import { parseWebThing } from "./builder";

export class DeviceRegistry {
  things: Thing[] = [];
  mq: MessageQueue;

  constructor(mq: MessageQueue) {
    this.mq = mq;
  }

  async init() {
    await this.mq.subscribe("register", this.consume.bind(this));
  }

  consume(topic: string, msg: Buffer) {
    if (msg !== null) {
      const obj = JSON.parse(msg.toString());

      this.things.push(parseWebThing(obj));
    }
  }
}
