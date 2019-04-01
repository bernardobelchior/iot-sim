import Effect from "./Effect";

/**
 * An Effect which creates a notification
 */
export default class NotificationEffect extends Effect {
  message: string;

  /**
   *
   * @param label
   * @param message
   */
  constructor(label: string, message: string) {
    super(label);
    this.message = message;
  }

  /**
   * Creates an effect from a given object
   * @param {any} desc
   */
  static fromDescription(desc: any) {
    if (!desc.hasOwnProperty("label")) {
      throw new Error("Label property missing from object.");
    }
    if (!desc.hasOwnProperty("message")) {
      throw new Error("Message missing from object.");
    }

    return new this(desc.label, desc.message);
  }

  /**
   * Creates a JSON object from a notification effect instance
   * @return {Object}
   */
  toDescription(): Object {
    return Object.assign(super.toDescription(), {
      message: this.message
    });
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
