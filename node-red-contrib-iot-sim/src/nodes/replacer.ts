import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { ProxyConfig } from "./proxy-config";
import { ReplacerInput } from "iot-simulator";

interface Config extends NodeProperties {
  proxy: string;
}

module.exports = function(RED: Red) {
  class Replacer extends Node {
    inputConfig: ReplacerInput;

    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      const proxy = RED.nodes.getNode(config.proxy) as ProxyConfig;
    }

    addInput(inputConfig: ReplacerInput) {
      this.inputConfig = inputConfig;
    }
  }

  Replacer.registerType(RED, "replacer");
};

export interface Replacer extends Node {}
