import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { GeneratorOutput } from "iot-simulator";

type Stringify<T extends object> = { [key: string]: string };

interface Config extends NodeProperties, Stringify<GeneratorOutput> {}

module.exports = function(RED: Red) {
  class GeneratorOutputNode extends Node {
    config: GeneratorOutput;

    constructor(config: Config) {
      super(RED);

      this.config = {
        delay: parseFloat(config.delay) || 0,
        value: config.value || undefined,
        href: config.href || undefined,
        property: config.property || undefined
      };

      this.createNode(config);
    }
  }

  GeneratorOutputNode.registerType(RED, "generator-output");
};

export interface GeneratorOutputNode extends Node {
  config: GeneratorOutput;
}
