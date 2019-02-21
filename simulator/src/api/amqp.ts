import amqp = require("amqplib");
import { vars } from "../util/vars";

export const createExchange = async () => {
  try {
    const conn = await amqp.connect(vars.AMQP_URI);
    const ch = await conn.createChannel();
    await ch.assertExchange("source", "topic", {
      durable: true
    });
  } catch (error) {
    throw new Error(error);
  }
};

export const publishMessage = async (data: any) => {
  try {
    const conn = await amqp.connect(vars.AMQP_URI);
    const ch = await conn.createChannel();
    await ch.checkExchange("source");
    await ch.publish(
      "source",
      "topic",
      Buffer.from(JSON.stringify({ ...data })),
      {
        contentType: "application/json"
      }
    );
  } catch (error) {
    throw new Error(error);
  }
};

export const consumeMessage = async (queue: string) => {
  try {
    const conn = await amqp.connect(vars.AMQP_URI);
    const ch = await conn.createChannel();
    await ch.assertQueue(queue, { exclusive: true });
    await ch.bindQueue(queue, "source", "#");
    ch.consume(queue, (data: any) => {
      const content = data.content.toString();
      const message = JSON.parse(content);
      console.log(message);
    });
  } catch (error) {
    throw new Error(error);
  }
};
