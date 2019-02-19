import { builder, IEnvironment } from './builder'
import { Event } from './controllers/event';
import { Action } from './controllers/action';
import { ActionRequest } from './controllers/actionRequest';
import * as amqp from './amqp';

export default async () => {
  const environment: IEnvironment = builder();

  try {
    await amqp.consumeMessage('topic');
    await amqp.publishMessage({ message: 'test' });

    for (const thing of environment.things) {

      // Events
      // TODO Emit events when an action/update triggers the event
      const events = thing.getEvents();
      events.forEach((e: Event, key: string): void => thing.eventNotify(e.id));
    
      // Actions
      // TODO Define the action according to the input. Propagate effects to the thing
      // 
      const actions = thing.getActions();
      actions.forEach((a: Action, key: string): ActionRequest | undefined => thing.requestAction(a.id));
    }
  } catch (error) {
    throw new Error('Error establishing connection to amqp');
  }
}