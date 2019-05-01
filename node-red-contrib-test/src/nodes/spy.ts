import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";

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

      this.on("input", msg => {
        if (msg.payload.cmd === "run") {
          node.once("input", msg => {
            this.send([undefined, msg]);
          });

          this.send([{ payload: { cmd: "run" } }, undefined]);
        }
      });
    }
  }

  SpyNode.registerType(RED, "spy");
};

export interface SpyNode extends Node {}
