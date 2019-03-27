import * as things from "./things";
import * as properties from "./properties";
import { ActionType } from "typesafe-actions";

export type RootActions = ActionType<typeof things | typeof properties>;

export default {
  things,
  properties
};
