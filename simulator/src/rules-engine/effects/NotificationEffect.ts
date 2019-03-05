import { Effect } from "./Effect";
import assert from "assert";

interface INotificationEffect {
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

    assert(desc.hasOwnProperty("message"));

    this.message = desc.message;
  }

  /**
   * @return {INotificationEffect}
   */
  toDescription(): INotificationEffect {
    return Object.assign(
      super.toDescription(),
      {
        message: this.message,
      }
    );
  }

  /**
   * @param {boolean} state
   */
  setState(state: boolean) {
    if (!state) {
      return;
    }
    // TODO Send notification
  }
}
