import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { createRunTestMessage } from "../util";

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

        msgs[output] = createRunTestMessage();

        this.send(msgs);
      };

      this.context().flow.testDone = testDone;

      setTimeout(testDone, 0);

      /* Wait until the parent flow has been initialized */
      setTimeout(() => console.log(RED.nodes.getNode(config.z)), 0);
    }
  }

  TestRunnerNode.registerType(RED, "test-runner");
};

export interface TestRunnerNode extends Node {}
