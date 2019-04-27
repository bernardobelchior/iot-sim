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
  class MockNode extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      const node = RED.nodes.getNode(config.node);

      this.on("input", msg => {
        console.log(msg);
        if (msg.payload.cmd === "run") {
          node.send({
            payload: {
              messageType: "propertyStatus",
              data: {
                temperature: 30
              }
            }
          });
        }
      });
    }
  }

  MockNode.registerType(RED, "mock");
};

export interface MockNode extends Node {}
