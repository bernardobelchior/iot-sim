import { Effect } from './Effect';
import assert from 'assert';
import { NotificationEffectDescription } from './util';

/**
 * An Effect which creates a notification
 */
export class NotificationEffect extends Effect {
  message: string;

  /**
   * @param {NotificationEffectDescription} desc
   */
  constructor(desc: NotificationEffectDescription) {
    super(desc);

    assert(desc.hasOwnProperty('message'));

    this.message = desc.message;
  }

  /**
   * @return {EffectDescription}
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

  }
}
