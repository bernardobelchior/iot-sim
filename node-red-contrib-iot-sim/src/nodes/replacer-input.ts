import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { ReplacerInput } from "iot-simulator";

interface Config extends NodeProperties, ReplacerInput {}

module.exports = function(RED: Red) {
  class ReplacerInputNode extends Node {
    config: ReplacerInput;

    constructor(config: Config) {
      super(RED);
      this.config = {
        property: config.property,
        href: config.href,
        suppress: config.suppress
      };

      this.createNode(config);
    }
  }

  ReplacerInputNode.registerType(RED, "replacer-input");
};

export interface ReplacerInputNode extends Node {
  config: Config;
}
