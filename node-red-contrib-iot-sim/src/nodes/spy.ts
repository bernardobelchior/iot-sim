import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { ProxyConfigNode } from "./proxy-config";
import { GeneratorInputNode } from "./generator-input";
import { GeneratorOutputNode } from "./generator-output";

interface Config extends NodeProperties {
  flow: string;
  node: string;
}

module.exports = function(RED: Red) {
  class SpyNode extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      const node = RED.nodes.getNode(config.node);

      node.once("input", msg => {
        this.send(msg);
      });
    }
  }

  SpyNode.registerType(RED, "spy");
};

export interface SpyNode extends Node {}
