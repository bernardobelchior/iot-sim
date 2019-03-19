import Trigger from "./Trigger";

/**
 * An abstract class for triggers whose input is a single property
 */
export default class TimeTrigger extends Trigger {
  time: Date;
  timeout?: any;

  /**
   *
   * @param {string} label
   * @param {Date} time
   */
  constructor(label: string, time: Date) {
    super(label);
    this.time = time;
    this.sendOn = this.sendOn.bind(this);
    this.sendOff = this.sendOff.bind(this);
  }

  /**
   * Creates a trigger from a given object
   * @param {any} desc
   */
  static fromDescription(desc: any) {
    if (!desc.hasOwnProperty("time")) {
      throw new Error("Time property missing from object.");
    }
    return new this(desc.label, new Date(desc.time));
  }

  /**
   * Creates a JSON object from a time trigger instance
   * @return {Object}
   */
  toDescription(): Object {
    return Object.assign(super.toDescription(), { time: this.time });
  }

  async start() {
    this.scheduleNext();
  }

  stop() {
    clearTimeout(this.timeout);
    this.timeout = undefined;
  }

  scheduleNext() {
    const parts = this.time.toString().split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    // Time is specified in UTC
    const nextTime = new Date();
    nextTime.setUTCHours(hours, minutes, 0, 0);

    if (nextTime.getTime() < Date.now()) {
      // NB: this will wrap properly into the next month/year
      nextTime.setDate(nextTime.getDate() + 1);
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(this.sendOn, nextTime.getTime() - Date.now());
  }

  sendOn() {
    this.emit("stateChanged", { on: true, value: Date.now() });
    this.timeout = setTimeout(this.sendOff, 60 * 1000);
  }

  sendOff() {
    this.emit("stateChanged", { on: false, value: Date.now() });
    this.scheduleNext();
  }
}
