import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { ProxyConfigNode } from "./proxy-config";

interface Config extends NodeProperties {
  proxyConfig: string;
}

module.exports = function(RED: Red) {
  class Proxy extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      const proxyConfigNode = RED.nodes.getNode(
        config.proxyConfig
      ) as ProxyConfigNode;

      proxyConfigNode.start();
    }
  }

  Proxy.registerType(RED, "iot-sim-proxy");
};
