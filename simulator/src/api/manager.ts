import { builder, IEnvironment } from './builder'
import * as amqp from './amqp';

export default async () => {
  const environment: IEnvironment = builder();

  try {
    await amqp.consumeMessage('topic');
    await amqp.publishMessage({ message: 'test' });     

  } catch (error) {
    throw new Error('Error establishing connection to amqp');
  }
}