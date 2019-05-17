import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { createRunTestMessage, TestFailure } from "../util";

interface Config extends NodeProperties {
  outputs: number;
}

module.exports = function(RED: Red) {
  class TestRunnerNode extends Node {
    failures: TestFailure[] = [];

    constructor(config: Config) {
      super(RED);

      this.createNode(config);
      let output = -1;

      this.status({ fill: "yellow", shape: "ring", text: "waiting" });

      const testDone = (failed?: TestFailure) => {
        if (output === config.outputs - 1) {
          if (this.failures.length === 0) {
            this.status({
              fill: "green",
              shape: "ring",
              text: "all tests passed"
            });
          } else {
            this.status({
              fill: "red",
              shape: "ring",
              text: `${this.failures.length} tests failed`
            });

            if (this.context().flow.generateReport) {
              this.context().flow.generateReport(this.failures);
            }
          }

          return;
        }

        output++;

        const msgs = [];
        for (let i = 0; i < config.outputs; i++) {
          msgs.push(undefined);
        }

        msgs[output] = createRunTestMessage();

        if (failed) {
          this.failures.push(failed);
        }

        this.send(msgs);
      };

      this.context().flow.testDone = testDone;

      this.once("input", msg => {
        if (msg.payload === "start_tests") {
          this.status({ fill: "yellow", shape: "dot", text: "started" });
          testDone();
        }
      });
    }
  }

  TestRunnerNode.registerType(RED, "test-runner");
};

export interface TestRunnerNode extends Node {}
