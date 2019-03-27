import { AsyncMqttClient, connect, Packet, IPublishPacket } from "async-mqtt";

export enum QoS {
  AtMostOnce = 0,
  AtLeastOnce = 1,
  ExactlyOnce = 2
}

export async function messageQueueBuilder(
  readUrl: string,
  writeUrl: string
): Promise<MessageQueue> {
  const readClient = await connect(readUrl);
  const writeClient = await connect(writeUrl);

  return new MessageQueue(readClient, writeClient);
}

export type MessageCallback = (
  topic: string,
  payload: Buffer,
  packet: IPublishPacket
) => void;

/**
 * Message Queue class that abstracts message queue internals.
 * It reads and writes from different clients. The purpose of this
 * is so that a proxy can be used between the different queues.
 * If the read and write client are the same, then it will have the
 * same effect as using just one client.
 */
export class MessageQueue {
  readClient: AsyncMqttClient;
  writeClient: AsyncMqttClient;
  messageHandlers: { [topic: string]: MessageCallback[] } = {};

  constructor(readClient: AsyncMqttClient, writeClient: AsyncMqttClient) {
    this.readClient = readClient;
    this.writeClient = writeClient;

    this.readClient.on("message", this.messageHandler.bind(this));
  }

  private messageHandler(topic: string, payload: Buffer, packet: Packet): void {
    // TODO: Add support for '+' and '#' wildcards

    Object.entries(this.messageHandlers).forEach(([key, handlers]) => {
      if (key === topic || key === "#") {
        handlers.forEach(handler =>
          handler(topic, payload, packet as IPublishPacket)
        );
      }
    });
  }

  /**
   * Publishes to a topic
   * @param topic Topic to publish.
   * @param message Message to send.
   * @param qos Quality of Service. Default value is at most once.
   */
  publish(topic: string, message: Buffer | string, qos: QoS = QoS.AtMostOnce) {
    return this.writeClient.publish(topic, message, {
      qos
    });
  }

  /**
   * Subscribes to a topic.
   * @param topic Topic to subscribe.
   * @param onMessage Function to call whenever a message is received. If this topic was subscribed previously, onMessage will replace the old handler.
   * @param qos QoS. Exactly once is not supported, since RabbitMQ does not support it. Default value is at most once.
   */
  async subscribe(
    topic: string,
    onMessage: MessageCallback,
    qos: Exclude<QoS, QoS.ExactlyOnce> = QoS.AtMostOnce
  ) {
    await this.readClient.subscribe(topic, {
      qos
    });

    this.messageHandlers[topic] = this.messageHandlers[topic] || [];
    this.messageHandlers[topic].push(onMessage);
  }

  /**
   * Closes the connection gracefully. Promise resolves once all messages have been ACKed.
   */
  end() {
    return Promise.all([this.readClient.end(), this.writeClient.end()]);
  }
}
