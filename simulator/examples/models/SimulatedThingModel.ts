import { MessageType, ThingModel } from "./ThingModel";
import { MessageQueue } from "../../src/api/MessageQueue";

export abstract class SimulatedThingModel extends ThingModel {
  protected constructor(messageQueue: MessageQueue) {
    super(messageQueue);
  }

  protected sendMessage(type: MessageType, data: object) {
    const msg = {
      simulated: true,
      messageType: type,
      data
    };

    return this.mq.publish(this.getHref(), JSON.stringify(msg));
  }
}
