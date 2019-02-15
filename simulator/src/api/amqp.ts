import amqp = require('amqplib');
import { vars } from '../util/vars';

export const createExchange = async () => {
  const conn = await amqp.connect(vars.AMQP_URI);
  const ch = await conn.createChannel();
  await ch.assertExchange('source', 'topic', {
    durable: true
  });
}

export const publishMessage = async (msg: string) => {
  const conn = await amqp.connect(vars.AMQP_URI);
  conn.createChannel()
    .tap((ch: amqp.Channel) => ch.checkExchange('source'))
    .then((ch: amqp.Channel) => ch.publish('source', 'key', new Buffer(msg)))
    .finally(() => conn.close());
};

export const consumeMessage = async (queue: string) => {
  const conn = await amqp.connect(vars.AMQP_URI);
  conn.createChannel()
    .tap((ch: amqp.Channel) => ch.checkExchange('source'))
    .tap((ch: amqp.Channel) => ch.checkQueue(queue))
    .then((ch: amqp.Channel) => ch.consume(queue, (msg: any) => {
      if (msg != null) {
        if (msg.properties.contentType === 'application/json') {
            console.log('New Message: ' + msg.content.toString());
        }
    }
    }))
    .finally(() => conn.close());

}