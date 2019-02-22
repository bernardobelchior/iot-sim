import amqp, {
  Channel,
  Connection,
  ConsumeMessage,
  Message,
  Replies
} from "amqplib";
import { toNativePromise } from "../util/promise";
import logger from "../util/logger";

type ExchangeType = "topic" | "direct" | "fanout" | "headers";

export async function messageQueueBuilder(url: string): Promise<MessageQueue> {
  const connection: Connection = await amqp.connect(url);

  const mq = new MessageQueue(url, connection);

  await mq.init();

  return mq;
}

export class MessageQueue {
  url: string;
  channel: Channel | undefined;
  connection: Connection;

  constructor(url: string, connection: Connection) {
    this.url = url;
    this.connection = connection;
  }

  async init() {
    this.channel = await this.connection.createChannel();
  }

  async assertQueue(queue: string) {
    if (this.channel === undefined) {
      logger.error("MessageQueue: tried to assert queue without channel");
      throw new Error("MessageQueue: tried to assert queue without channel");
    }

    return this.channel.assertQueue(queue);
  }

  async bindQueue(queue: string, source: string, routingKey: string) {
    if (this.channel === undefined) {
      logger.error("MessageQueue: tried to bind queue without channel");
      throw new Error("MessageQueue: tried to bind queue without channel");
    }

    return this.channel.bindQueue(queue, source, routingKey);
  }

  async createExchange(exchange: string, type: ExchangeType) {
    if (this.channel === undefined) {
      logger.error("MessageQueue: tried to create exchange without channel");
      throw new Error("MessageQueue: tried to create exchange without channel");
    }

    await this.channel.assertExchange(exchange, type, {
      durable: true
    });
  }

  publish(exchange: string, routingKey: string, message: Buffer): boolean {
    if (this.channel === undefined) {
      logger.error("MessageQueue: tried to publish without channel");
      throw new Error("MessageQueue: tried to publish without channel");
    }

    return this.channel.publish(exchange, routingKey, message, {
      contentType: "application/json"
    });
  }

  consume(
    queue: string,
    onMessage: (msg: ConsumeMessage | null) => any
  ): Promise<Replies.Consume> {
    if (this.channel === undefined) {
      logger.error("MessageQueue: tried to consume without channel");
      throw new Error("MessageQueue: tried to consume without channel");
    }

    return toNativePromise(this.channel.consume(queue, onMessage));
  }

  ack(message: Message) {
    if (this.channel === undefined) {
      logger.error("MessageQueue: tried to ack message without channel");
      throw new Error("MessageQueue: tried to ack message without channel");
    }

    return this.channel.ack(message);
  }
}
