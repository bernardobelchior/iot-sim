import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { ProxyConfigNode } from "./proxy-config";
import { GeneratorInputNode } from "./generator-input";
import { GeneratorOutputNode } from "./generator-output";

interface Config extends NodeProperties {
  flow: string;
  node: string;
}

module.exports = function(RED: Red) {
  class AssertNode extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      this.on("input", msg => {
        if (msg.payload.assert === true) {
          this.status({ fill: "green", shape: "ring", text: "passed" });
        } else {
          this.status({ fill: "red", shape: "ring", text: "passed" });
        }
      });

      this.status({ fill: "yellow", shape: "ring", text: "running" });
    }
  }

  AssertNode.registerType(RED, "assert");
};

export interface AssertNode extends Node {}
