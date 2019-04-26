import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import * as helper from "node-red-test-helper";

interface Config extends NodeProperties {
  flow: string;
}

module.exports = function(RED: Red) {
  class TestRunnerNode extends Node {
    constructor(config: Config) {
      super(RED);
      RED.nodes.eachNode(n => n.prototype.constructor);

      helper.load([]);

      this.createNode(config);

      this.send({
        payload: {
          cmd: "run"
        }
      });
    }
  }

  TestRunnerNode.registerType(RED, "test-runner");
};

export interface TestRunnerNode extends Node {}
