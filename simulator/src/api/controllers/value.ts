/**
 * An observable value interface.
 */

import EventEmitter from 'events';

/**
 * A property value.
 *
 * This is used for communicating between the Thing representation and the
 * actual physical thing implementation.
 *
 */
export class Value extends EventEmitter {
  currValue: any;
  valueForwarder: Function | null;

  /**
   * Initialize the object.
   *
   * @param {*} initialValue The initial value
   * @param {function?} valueForwarder The method that updates the actual value
   *                                   on the thing
   */
  constructor(value: any, valueForwarder = null) {
    super();
    this.currValue = value;
    this.valueForwarder = valueForwarder;
  }

  /**
   * Set a new value for this thing.
   *
   * @param {*} value Value to set
   */
  set(value: any) {
    if (this.valueForwarder) {
      this.valueForwarder(value);
    }

    this.notifyOfExternalUpdate(value);
  }

  /**
   * Return the last known value from the underlying thing.
   *
   * @returns the value.
   */
  get() {
    return this.currValue;
  }

  /**
   * Notify observers of a new value.
   *
   * @param {*} value New value
   */
  notifyOfExternalUpdate(value: any) {
    if (typeof value !== 'undefined' &&
        value !== null &&
        value !== this.currValue) {
      this.currValue = value;
      this.emit('update', value);
    }
  }
}