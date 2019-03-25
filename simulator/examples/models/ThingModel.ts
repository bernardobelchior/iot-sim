import { MessageQueue } from "../../src/api/MessageQueue";
import { REGISTER_TOPIC } from "../../src/api/DeviceRegistry";

export abstract class ThingModel {
  mq: MessageQueue;

  protected constructor(mq: MessageQueue) {
    this.mq = mq;
  }

  public abstract getDescription(): string;

  public async register() {
    return this.mq.publish(REGISTER_TOPIC, this.getDescription());
  }
}
