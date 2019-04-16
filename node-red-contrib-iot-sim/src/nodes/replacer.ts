import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { ProxyConfig } from "./proxy-config";
import { ReplacerOutputNode } from "./replacer-output";
import { ReplacerInputNode } from "./replacer-input";

interface Config extends NodeProperties {
  proxy: string;
  inputConfig: string;
  outputConfig: string;
}

module.exports = function(RED: Red) {
  class ReplacerNode extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      const proxy = RED.nodes.getNode(config.proxy) as ProxyConfig;
      const inputNode = RED.nodes.getNode(
        config.inputConfig
      ) as ReplacerInputNode;
      const outputNode = RED.nodes.getNode(
        config.outputConfig
      ) as ReplacerOutputNode;

      proxy.addReplacer(inputNode.config, outputNode.config);
    }
  }

  ReplacerNode.registerType(RED, "replacer");
};

export interface ReplacerNode extends Node {}
