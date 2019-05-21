import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { isResetTestMessage, isRunTestMessage } from "../util";

interface Config extends NodeProperties {}

module.exports = function(RED: Red) {
  class TestEndNode extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      this.on("input", msg => {
        if (isResetTestMessage(msg)) {
          this.reset();
          this.send(msg);
          return;
        }

        if (isRunTestMessage(msg)) {
          this.status({ fill: "green", shape: "ring", text: "finished" });
          this.context().flow.testRunner.testDone();
        } else {
          new Error(
            `Unexpected message payload: "${JSON.stringify(msg.payload)}"`
          );
          this.status({ fill: "red", shape: "ring", text: "error" });
        }
      });

      this.on("close", () => {
        this.reset();
      });
    }

    private reset() {
      this.status({});
    }
  }

  TestEndNode.registerType(RED, "test-end");
};

export interface TestEndNode extends Node {}
