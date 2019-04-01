import { EventEmitter } from "events";
import { TriggerEmitter } from "../Events";

/**
 * The trigger component of a Rule which monitors some state and passes on
 * whether to be active to the Rule's effect
 */
export default class Trigger extends (EventEmitter as {
  new (): TriggerEmitter;
}) {
  type: string;
  label: string;

  /**
   * Create a Trigger based on a wire-format description with a property
   * @param {string} label
   */
  constructor(label: string) {
    super();
    this.type = this.constructor.name;
    this.label = label;
  }

  /**
   * Creates a trigger from a given object
   * @param {any} desc
   */
  static fromDescription(desc: any) {
    if (!desc.hasOwnProperty("label")) {
      throw new Error("Label property missing from object.");
    }
    return new this(desc.label);
  }

  /**
   * Creates a JSON object from a trigger instance
   * @return {Object}
   */
  toDescription(): Object {
    return {
      type: this.type,
      label: this.label
    };
  }

  /**
   * Starts the trigger execution
   */
  async start() {
    throw new Error("Unimplemented");
  }

  /**
   * Stops the trigger execution
   */
  stop() {
    throw new Error("Unimplemented");
  }

  /**
   * Get the subscriptions necessary for the trigger to activate when the condition is met
   */
  getSubscriptions(): string | string[] {
    return [];
  }

  /**
   * Check if the conditions are met to activate the trigger
   * @param topic
   * @param data
   */
  update(topic: string, data: any) {}
}
