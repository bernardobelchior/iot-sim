import actions, { RootActions } from "../actions";
import { getType } from "typesafe-actions";

export type State = {
  readonly things: Array<{ [key: string]: any }>;
};

export const initialState: State = {
  things: []
};

export default (state: State = initialState, action: RootActions) => {
  switch (action.type) {
    case getType(actions.things.fetchThingsAction.success):
      return {
        ...state,
        things: action.payload
      };

    default:
      return state;
  }
};
