import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { createRunTestMessage, isRunTestMessage } from "../util";
import assert = require("assert");

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
      assert(node !== null);

      this.on("input", msg => {
        if (isRunTestMessage(msg)) {
          node.once("input", msg => {
            this.send([undefined, msg]);
          });

          this.send([createRunTestMessage(), undefined]);
        }
      });
    }
  }

  SpyNode.registerType(RED, "spy");
};

export interface SpyNode extends Node {}
