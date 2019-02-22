import * as things from "./things";
import { ActionType } from "typesafe-actions";

export type RootActions = ActionType<typeof things>;

export default {
  things
};
