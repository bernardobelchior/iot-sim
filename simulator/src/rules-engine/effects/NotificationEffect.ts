import { Effect } from './Effect';
import { State } from '.';
import assert from 'assert';

export interface INotificationEffect {
  type: string;
  label: string;
  message: string;
}

/**
 * An Effect which creates a notification
 */
export class NotificationEffect extends Effect {
  message: string;

  /**
   * @param {INotificationEffect} desc
   */
  constructor(desc: INotificationEffect) {
    super(desc);

    assert(desc.hasOwnProperty('message'));

    this.message = desc.message;
  }

  /**
   * @return {INotificationEffect}
   */
  toDescription() {
    return Object.assign(
      super.toDescription(),
      {
        message: this.message,
      }
    );
  }

  /**
   * @param {State} state
   */
  setState(state: State) {
    if (!state.on) {
      return;
    }
    // TODO Send notification
  }
}
