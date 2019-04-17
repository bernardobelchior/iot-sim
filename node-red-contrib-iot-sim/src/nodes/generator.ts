import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { ProxyConfigNode } from "./proxy-config";
import { GeneratorInputNode } from "./generator-input";
import { GeneratorOutputNode } from "./generator-output";

interface Config extends NodeProperties {
  proxy: string;
  inputConfig: string;
  outputConfig: string;
}

module.exports = function(RED: Red) {
  class GeneratorNode extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      const proxy = RED.nodes.getNode(config.proxy) as ProxyConfigNode;
      const inputNode = RED.nodes.getNode(
        config.inputConfig
      ) as GeneratorInputNode;
      const outputNode = RED.nodes.getNode(
        config.outputConfig
      ) as GeneratorOutputNode;

      proxy.addGenerator(inputNode.config, outputNode.config);
    }
  }

  GeneratorNode.registerType(RED, "generator");
};

export interface GeneratorNode extends Node {}
