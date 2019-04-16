import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { ReplacerOutput } from "iot-simulator";

interface Config extends NodeProperties, ReplacerOutput {}

module.exports = function(RED: Red) {
  class ReplacerOutput extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);
    }
  }

  ReplacerOutput.registerType(RED, "replacer-output");
};
