import {
  AsyncMqttClient,
  connect,
  OnMessageCallback,
  Packet
} from "async-mqtt";

export enum QoS {
  AtMostOnce = 0,
  AtLeastOnce = 1,
  ExactlyOnce = 2
}

export async function messageQueueBuilder(url: string): Promise<MessageQueue> {
  const client = await connect(url);

  return new MessageQueue(url, client);
}

/**
 * Message Queue class that abstracts message queue internals.
 */
export class MessageQueue {
  url: string;
  client: AsyncMqttClient;
  messageHandlers: { [topic: string]: OnMessageCallback[] } = {};

  constructor(url: string, client: AsyncMqttClient) {
    this.url = url;
    this.client = client;

    this.client.on("message", this.messageHandler.bind(this));
  }

  private messageHandler(topic: string, payload: Buffer, packet: Packet): void {
    // TODO: Add support for '+' and '#' wildcards

    Object.entries(this.messageHandlers).forEach(([key, handlers]) => {
      if (key === topic) {
        handlers.forEach(handler => handler(topic, payload, packet));
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
    return this.client.publish(topic, message, {
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
    onMessage: OnMessageCallback,
    qos: Exclude<QoS, QoS.ExactlyOnce> = QoS.AtMostOnce
  ) {
    await this.client.subscribe(topic, {
      qos
    });

    this.messageHandlers[topic] = this.messageHandlers[topic] || [];
    this.messageHandlers[topic].push(onMessage);
  }

  /**
   * Closes the connection gracefully. Promise resolves once all messages have been ACKed.
   */
  end() {
    return this.client.end();
  }
}
