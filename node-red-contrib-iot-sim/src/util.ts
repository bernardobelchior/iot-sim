import { NodeProperties } from "node-red";
import { omit } from "lodash";

export function removePropsFromConfig<T extends NodeProperties>(config: T) {
  return omit(config, ["id", "type", "name", "_users", "x", "y", "z"]);
}
