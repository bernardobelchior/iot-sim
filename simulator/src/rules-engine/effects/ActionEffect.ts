import assert from "assert";
import { Effect } from "./Effect";

interface IActionEffect {
  type: string;
  label: string;
  thing: any;
  action: any;
  parameters: any;
}

/**
 * An Effect which creates an action
 */
export class ActionEffect extends Effect {
  thing: any;
  action: any;
  parameters: any = {};

  /**
   * @param {IActionEffect} desc
   */
  constructor(desc: IActionEffect) {
    super(desc);

    assert(desc.thing);
    assert(desc.action);

    this.thing = desc.thing;
    this.action = desc.action;
    this.parameters = desc.parameters || {};
  }

  /**
   * @return {EffectDescription}
   */
  toDescription() {
    return Object.assign(
      super.toDescription(),
      {
        thing: this.thing,
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
