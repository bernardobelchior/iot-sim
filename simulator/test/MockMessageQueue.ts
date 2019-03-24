import { MessageQueue, QoS } from "../src/MessageQueue";
import { OnMessageCallback, IPublishPacket, connect } from "async-mqtt";

/**
 * MessageQueue mock that is always successful and does not rely on
 * a broker.
 */
export class MockMessageQueue extends MessageQueue {
  constructor() {
    super("", connect(""));
  }

  async subscribe(
    topic: string,
    onMessage: OnMessageCallback,
    qos: Exclude<QoS, QoS.ExactlyOnce> = QoS.AtMostOnce
  ): Promise<void> {
    return Promise.resolve();
  }

  publish(
    topic: string,
    message: Buffer | string,
    qos: QoS = QoS.AtMostOnce
  ): Promise<IPublishPacket> {
    const ret: IPublishPacket = {
      cmd: "publish",
      qos,
      dup: false,
      retain: false,
      topic: topic,
      payload: message
    };

    return Promise.resolve(ret);
  }

  end(): Promise<void> {
    return Promise.resolve();
  }
}
