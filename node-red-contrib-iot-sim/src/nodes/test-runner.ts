import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";

interface Config extends NodeProperties {
  outputs: number;
}

module.exports = function(RED: Red) {
  class TestRunnerNode extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);
      let output = -1;

      const testDone = () => {
        if (output === config.outputs) {
          return;
        }

        output++;

        const msgs = [];
        for (let i = 0; i < config.outputs; i++) {
          // tslint:disable-next-line:no-null-keyword
          msgs.push(null);
        }

        msgs[output] = {
          payload: {
            cmd: "run"
          }
        };

        this.send(msgs);
      };

      this.context().flow.testDone = testDone;

      testDone();
    }
  }

  TestRunnerNode.registerType(RED, "test-runner");
};

export interface TestRunnerNode extends Node {}
