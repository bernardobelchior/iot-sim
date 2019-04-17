import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { GeneratorInput } from "iot-simulator";

interface Config extends NodeProperties, GeneratorInput {}

module.exports = function(RED: Red) {
  class GeneratorInputNode extends Node {
    config: GeneratorInput;

    constructor(config: Config) {
      super(RED);
      this.config = {
        cron: config.cron
      };

      this.createNode(config);
    }
  }

  GeneratorInputNode.registerType(RED, "generator-input");
};

export interface GeneratorInputNode extends Node {
  config: Config;
}
