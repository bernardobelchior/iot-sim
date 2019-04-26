import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { ProxyConfigNode } from "./proxy-config";
import { GeneratorInputNode } from "./generator-input";
import { GeneratorOutputNode } from "./generator-output";

interface Config extends NodeProperties {}

module.exports = function(RED: Red) {
  class TestNode extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      this.on("input", msg => {
        console.log(msg);
      });
    }
  }

  TestNode.registerType(RED, "test");
};

export interface TestNode extends Node {}
