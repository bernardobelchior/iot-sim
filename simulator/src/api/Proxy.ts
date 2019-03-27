import { MessageQueue } from "./MessageQueue";
import { DeviceRegistry, REGISTER_TOPIC } from "./DeviceRegistry";
import { IPublishPacket } from "async-mqtt";
import { Thing } from "./models/Thing";
import assert = require("assert");

export function proxyBuilder(
  deviceRegistry: DeviceRegistry,
  messageQueue: MessageQueue
): Proxy {
  const reverseMessageQueue = new MessageQueue(
    messageQueue.writeClient,
    messageQueue.readClient
  );

  return new Proxy(deviceRegistry, reverseMessageQueue);
}

/**
 * Proxy class that joins a 'read' and a 'write' queue together.
 * This class, along with the DeviceRegistry makes sure that
 * messages from simulated devices "overwrite" messages from
 * non-simulated ones.
 * Must call `start` before the Proxy starts redirecting messages.
 */
class Proxy {
  /** This message queue writes to the read queue, and reads from the write
   * queue, basically reversing the job of the normal `messageQueue`.
   * It is used to redirect messages from the read to the write queue.
   */
  private reverseMessageQueue: MessageQueue;
  private registry: DeviceRegistry;

  constructor(
    deviceRegistry: DeviceRegistry,
    reverseMessageQueue: MessageQueue
  ) {
    this.reverseMessageQueue = reverseMessageQueue;
    this.registry = deviceRegistry;
  }

  async start() {
    await this.reverseMessageQueue.subscribe("#", this.proxyMessage.bind(this));
  }

  static removeSimulatedProperty(message: Buffer) {
    const msg = JSON.parse(message.toString());

    delete msg["simulated"];

    return JSON.stringify(msg);
  }

  private async proxyMessage(
    topic: string,
    message: Buffer,
    packet: IPublishPacket
  ) {
    const id = Thing.generateIdFromHref(topic);

    /* Register message is forwarded as-is */
    if (topic === REGISTER_TOPIC) {
      await this.reverseMessageQueue.publish(topic, message, packet.qos);
      return;
    }

    /* Proxying of messages:
     * If a physical thing with the given id exists, then one of the following
     * must happen:
     * - If there is also a simulated thing with the given id:
     *   - AND the message came from a simulated thing (i.e., contains the
     *     `simulated` property), then the `simulated` property is removed and
     *     the message is forwarded to the read queue
     *   - AND the message came from a physical thing (i.e., does not contain
     *     the `simulated` property), then the message should be discarded since
     *     a simulated device has higher priority
     * - Otherwise, forward the message as-is, since there are no simulated
     *   devices with the same id.
     */

    if (!this.registry.existsPhysicalThingWithId(id)) {
      /* This should never happen, since the id is generated from the topic. */
      assert.fail(
        `Received message with topic '${topic}', but no thing with id '${id}' exists.`
      );
      return;
    }

    if (!this.registry.isThingSimulated(id)) {
      await this.reverseMessageQueue.publish(topic, message, packet.qos);
      return;
    }

    const msg = JSON.parse(message.toString());

    if (typeof msg === "object" && msg["simulated"]) {
      await this.reverseMessageQueue.publish(
        topic,
        Proxy.removeSimulatedProperty(message),
        packet.qos
      );
    } else {
      /* Discard message */
    }
  }
}
