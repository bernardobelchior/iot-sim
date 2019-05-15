import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { createRunTestMessage, isRunTestMessage } from "../util";

interface Config extends NodeProperties {}

module.exports = function(RED: Red) {
  class TestStartNode extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      this.status({ fill: "yellow", shape: "ring", text: "pending" });

      this.on("input", msg => {
        if (isRunTestMessage(msg)) {
          this.status({ fill: "green", shape: "ring", text: "started" });
          this.send(createRunTestMessage());
        }
      });
    }
  }

  TestStartNode.registerType(RED, "test-start");
};

export interface TestStartNode extends Node {}
