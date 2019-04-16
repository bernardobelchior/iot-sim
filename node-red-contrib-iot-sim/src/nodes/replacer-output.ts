import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { ReplacerOutput } from "iot-simulator";

interface Config extends NodeProperties, ReplacerOutput {}

module.exports = function(RED: Red) {
  class ReplacerOutputNode extends Node {
    config: ReplacerOutput;

    constructor(config: Config) {
      super(RED);

      this.config = {
        delay: config.delay || 0,
        expr: config.expr || undefined,
        value: config.value || undefined,
        href: config.href || undefined,
        property: config.property || undefined
      };

      this.createNode(config);
    }
  }

  ReplacerOutputNode.registerType(RED, "replacer-output");
};

export interface ReplacerOutputNode extends Node {
  config: Config;
}
