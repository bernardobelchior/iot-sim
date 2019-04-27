import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";

interface Config extends NodeProperties {}

module.exports = function(RED: Red) {
  class TestRunnerNode extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      this.send([
        {
          payload: {
            cmd: "run"
          }
        }
      ]);
    }
  }

  TestRunnerNode.registerType(RED, "test-runner");
};

export interface TestRunnerNode extends Node {}
