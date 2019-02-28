import { Thing } from "./models/Thing";
import { MessageQueue } from "./MessageQueue";
import { parseWebThing, builder } from "./builder";

export namespace DeviceRegistry {
  let things: Thing[] = [];
  let messageQueue: MessageQueue;

  export function setMessageQueue(mq: MessageQueue): void {
    messageQueue = mq;
  }

  export function initFromConfig() {
    things = [...builder().things];

    return init();
  }

  export function init() {
    // Check if it's working. Changed this to DeviceRegistry namespace. I cannot test because the connection to mqtt fails
    return messageQueue.subscribe("register", consume.bind(DeviceRegistry));
  }

  export const getThings = () => {
    return things;
  };

  export const getThing = (thingId: string) => {
    return things.find((x: Thing) => x.name === thingId);
  };

  export function consume(topic: string, msg: Buffer) {
    if (msg !== null) {
      const obj = JSON.parse(msg.toString());

      things.push(parseWebThing(obj));
    }
  }
}
