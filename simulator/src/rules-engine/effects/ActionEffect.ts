import Effect from "./Effect";
import { Action } from "../../api/models/Action";

/**
 * An Effect which creates an action
 */
export default class ActionEffect extends Effect {
  thingId: string;
  action: any;
  parameters: any = {};

  /**
   * @param {IActionEffect} desc
   */
  constructor(label: string, thingId: string, action: Action, parameters?: any) {
    super(label);

    this.thingId = thingId;
    this.action = action;
    this.parameters = parameters || {};
  }

  /**
   * @return {any}
   */
  toDescription(): any {
    return Object.assign(
      super.toDescription(),
      {
        thing: this.thingId,
        action: this.action,
        parameters: this.parameters,
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

    this.createAction();
  }

  async createAction() {
    try {
/*       const thing = await Things.getThing(this.thing);

      const action = new Action(this.action, this.parameters, thing);
      await Actions.add(action);
      await AddonManager.requestAction(this.thing, action.id, this.action,
                                       this.parameters); */
    } catch (e) {
      console.warn("Unable to dispatch action", e);
    }
  }
}
