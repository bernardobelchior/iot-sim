import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";

interface Config extends NodeProperties {
  flow: string;
  node: string;
  temperature: string;
}

module.exports = function(RED: Red) {
  class MockNode extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      const node = RED.nodes.getNode(config.node);

      this.on("input", function(msg) {
        if (msg.payload.cmd === "run") {
          node.send({
            payload: JSON.stringify({
              messageType: "propertyStatus",
              data: {
                temperature: parseFloat(config.temperature)
              }
            })
          });

          this.send({ payload: { cmd: "run" } });
        }
      });
    }
  }

  MockNode.registerType(RED, "mock");
};

export interface MockNode extends Node {}
