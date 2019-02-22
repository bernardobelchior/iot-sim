import { combineReducers } from "redux";
import things, { State as ThingsState } from "./things";
import { RootActions } from "../actions";

export type RootState = {
  things: ThingsState;
};

const rootReducer = combineReducers<RootState, RootActions>({ things });

export default rootReducer;
