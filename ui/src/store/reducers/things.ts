import actions, { RootActions } from "../actions";
import { getType } from "typesafe-actions";
import { Thing } from "../../models/Thing";

export type ThingMap = { [id: string]: Thing };

export type State = {
  readonly things: ThingMap;
};

export const initialState: State = {
  things: {}
};

export default (state: State = initialState, action: RootActions): State => {
  switch (action.type) {
    case getType(actions.things.fetchThingsAction.success):
      return {
        ...state,
        things: {
          ...state.things,
          ...action.payload
        }
      };

    default:
      return state;
  }
};
