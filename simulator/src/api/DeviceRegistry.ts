import { Thing } from "./controllers/thing";
import { MessageQueue } from "./MessageQueue";
import { ConsumeMessage } from "amqplib";
import { parseWebThing } from "./builder";

export class DeviceRegistry {
  things: Thing[] = [];
  mq: MessageQueue;

  constructor(mq: MessageQueue) {
    this.mq = mq;
  }

  async init() {
    await this.mq.createExchange("registry", "direct");
    await this.mq.assertQueue("register");
    await this.mq.bindQueue("register", "registry", "register");
    await this.mq.consume("register", this.consume.bind(this));
  }

  consume(msg: ConsumeMessage | null) {
    if (msg !== null) {
      const obj = JSON.parse(msg.content.toString());
      console.log(obj);

      this.things.push(parseWebThing(obj));

      this.mq.ack(msg);
    }
  }
}
