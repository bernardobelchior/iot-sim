import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { ReplacerInput } from "iot-simulator";

interface Config extends NodeProperties, ReplacerInput {}

module.exports = function(RED: Red) {
  class ReplacerInput extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);
    }
  }

  ReplacerInput.registerType(RED, "replacer-input");
};
