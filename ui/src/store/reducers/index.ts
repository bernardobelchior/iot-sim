import { combineReducers } from "redux";
import things, { State as ThingsState } from "./things";
import properties, { ThingsPropertiesState } from "./properties";
import { RootActions } from "../actions";

export type RootState = {
  things: ThingsState;
  properties: ThingsPropertiesState;
};

const rootReducer = combineReducers<RootState, RootActions>({
  things,
  properties
});

export default rootReducer;
