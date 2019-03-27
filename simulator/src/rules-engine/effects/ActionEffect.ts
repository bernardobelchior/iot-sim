import Effect from "./Effect";
import { SimulatorSingleton } from "../../Simulator";

/**
 * An Effect which creates an action
 */
export default class ActionEffect extends Effect {
  thingId: string;
  action: string;
  parameters: any = {};

  /**
   * @param {IActionEffect} desc
   */
  constructor(label: string, thingId: string, action: string, parameters?: any) {
    super(label);

    this.thingId = thingId;
    this.action = action;
    this.parameters = parameters || {};
  }

  /**
   * Creates an effect from a given object
   * @param {any} desc
   */
  static fromDescription(desc: any) {
    if (!desc.hasOwnProperty("label")) {
      throw new Error("Label property missing from object.");
    }
    if (!desc.hasOwnProperty("action")) {
      throw new Error("Action property missing from object.");
    }
    return new this(desc.label, desc.thingId, desc.action, desc.parameters);
  }

  /**
   * Creates a JSON object from a action effect instance
   * @return {Object}
   */
  toDescription(): Object {
    return Object.assign(super.toDescription(), {
      thing: this.thingId,
      action: this.action,
      parameters: this.parameters
    });
  }

  /**
   * @param {boolean} state
   */
  setState(state: boolean) {
    if (!state) {
      return;
    }

    this.createAction();
  }

  createAction() {
    try {
      const registry = SimulatorSingleton.getRegistry();
      const thing = registry.getThing(this.thingId);

      thing.requestAction(this.action, this.parameters);
    } catch (e) {
      console.warn("Unable to dispatch action", e);
    }
  }
}
