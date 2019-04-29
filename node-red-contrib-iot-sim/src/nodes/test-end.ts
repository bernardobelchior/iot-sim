import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";

interface Config extends NodeProperties {}

module.exports = function(RED: Red) {
  class TestEndNode extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      this.status({ fill: "yellow", shape: "ring", text: "pending" });

      this.on("input", msg => {
        if (msg.payload.cmd === "run") {
          this.status({ fill: "green", shape: "ring", text: "finished" });
          this.context().flow.testDone();
        } else {
          new Error(
            `Unexpected message payload: "${JSON.stringify(msg.payload)}"`
          );
          this.status({ fill: "red", shape: "ring", text: "error" });
        }
      });
    }
  }

  TestEndNode.registerType(RED, "test-end");
};

export interface TestEndNode extends Node {}