import { MessageQueue } from "../../src/api/MessageQueue";
import { REGISTER_TOPIC } from "../../src/api/DeviceRegistry";
import { MessageType } from "../../src/util/WebThingMessageUtils";

export abstract class ThingModel {
  mq: MessageQueue;

  protected constructor(mq: MessageQueue) {
    this.mq = mq;
  }

  public abstract getHref(): string;

  public abstract getDescription(): object;

  public async register() {
    return this.mq.publish(
      REGISTER_TOPIC,
      JSON.stringify(this.getDescription())
    );
  }

  protected sendMessage(type: MessageType, data: object) {
    const msg = {
      messageType: type,
      data
    };

    return this.mq.publish(this.getHref(), JSON.stringify(msg));
  }
}
