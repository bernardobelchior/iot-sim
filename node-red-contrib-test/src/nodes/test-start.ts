import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";

interface Config extends NodeProperties {}

module.exports = function(RED: Red) {
  class TestStartNode extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      this.status({ fill: "yellow", shape: "ring", text: "pending" });

      this.on("input", msg => {
        if (msg.payload.cmd === "run") {
          this.status({ fill: "green", shape: "ring", text: "started" });
          this.send({ payload: { cmd: "run" } });
        }
      });
    }
  }

  TestStartNode.registerType(RED, "test-start");
};

export interface TestStartNode extends Node {}
