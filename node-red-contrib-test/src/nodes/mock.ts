import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { createRunTestMessage, isRunTestMessage } from "../util";
import assert = require("assert");

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

      this.on("input", msg => {
        assert(node !== null);

        if (isRunTestMessage(msg)) {
          node.send({
            payload: JSON.stringify({
              messageType: "propertyStatus",
              data: {
                temperature: parseFloat(config.temperature)
              }
            })
          });

          this.send(createRunTestMessage());
        }
      });
    }
  }

  MockNode.registerType(RED, "mock");
};

export interface MockNode extends Node {}
