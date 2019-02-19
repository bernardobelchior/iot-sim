import { builder, IEnvironment } from './builder'
import * as amqp from './amqp';

export default async () => {
  const environment: IEnvironment = builder();

  try {
    await amqp.consumeMessage('topic');
    await amqp.publishMessage({ message: 'test' });     

    for (const thing of environment.things) {
      console.log(thing.name)
    }
  } catch (error) {
    console.log(error)
    throw new Error('Error establishing connection to amqp');
  }
}