import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { ProxyConfig } from "./proxy-config";
import { Config as ReplacerConfig } from "iot-simulator";

interface Config extends NodeProperties {
  name: string;
  proxy: string;
}

module.exports = function(RED: Red) {
  class Replacer extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      const proxy = RED.nodes.getNode(config.proxy) as ProxyConfig;

      proxy.injectConfig(
        new ReplacerConfig({
          replacers: [
            {
              input: {
                href: "/things/thermometer",
                property: "temperature",
                suppress: true
              },
              outputs: [
                {
                  value: 50
                }
              ]
            }
          ]
        })
      );
    }
  }

  Replacer.registerType(RED, "replacer");
};
