import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import {
  createResetTestMessage,
  createRunTestMessage,
  TestFailure
} from "../../util";
import { TestRunner } from "./TestRunner";

interface Config extends NodeProperties {
  outputs: number;
}

module.exports = function(RED: Red) {
  class TestRunnerNode extends Node {
    testsDone: boolean;
    totalOutputs: number;

    constructor(config: Config) {
      super(RED);

      this.testsDone = true;
      this.totalOutputs = config.outputs;

      this.createNode(config);

      this.status({ fill: "yellow", shape: "ring", text: "waiting" });

      this.on("input", msg => {
        if (msg.payload === "start_tests") {
          if (!this.testsDone) {
            this.warn(
              "Tried to start tests, but previous run is not done yet. Skipping..."
            );
            return;
          }

          const msgs = [];

          for (let i = 0; i < this.totalOutputs; i++) {
            msgs.push(createResetTestMessage());
          }

          this.send(msgs);
          this.start();
        }
      });

      this.on("close", () => {
        this.status({ fill: "yellow", shape: "ring", text: "waiting" });
      });
    }

    private start() {
      this.testsDone = false;
      const runner = new TestRunner(
        this.totalOutputs,
        this.onTestsDone.bind(this),
        this.runNextTest.bind(this)
      );

      this.context().flow.testRunner = runner;
      runner.start();
      this.status({ fill: "yellow", shape: "ring", text: "started" });
    }

    private runNextTest(testNumber: number) {
      const msgs = [];

      for (let i = 0; i < this.totalOutputs; i++) {
        msgs.push(undefined);
      }

      msgs[testNumber] = createRunTestMessage();

      this.send(msgs);
    }

    private onTestsDone(failures: TestFailure[]) {
      this.testsDone = true;
      if (failures.length === 0) {
        this.status({
          fill: "green",
          shape: "ring",
          text: "all tests passed"
        });
      } else {
        this.status({
          fill: "red",
          shape: "ring",
          text: `${failures.length} tests failed`
        });
      }

      if (this.context().flow.generateReport) {
        this.context().flow.generateReport(failures);
      }
    }
  }

  TestRunnerNode.registerType(RED, "test-runner");
};

export interface TestRunnerNode extends Node {}
