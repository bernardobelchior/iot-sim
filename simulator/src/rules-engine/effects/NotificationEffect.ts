import Effect from "./Effect";

/**
 * An Effect which creates a notification
 */
export default class NotificationEffect extends Effect {
  message: string;

  /**
   * @param {INotificationEffect} desc
   */
  constructor(label: string, message: string) {
    super(label);
    this.message = message;
  }

  /**
   * @return {any}
   */
  toDescription(): any {
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
