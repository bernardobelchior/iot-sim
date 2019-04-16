import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { AsyncClient, connect } from "async-mqtt";
import {
  Config as ReplaceConfig,
  MessageQueue,
  Proxy as SimulatorProxy
} from "iot-simulator";

interface Config extends NodeProperties {
  readServer: string;
  writeServer: string;
}

interface MqttNode extends Node {
  brokerurl: string;
  options: {
    username: string;
    password: string;
  };
}

function connectToNode(node: MqttNode): AsyncClient {
  return connect(
    node.brokerurl,
    {
      username: node.options.username,
      password: node.options.password
    }
  );
}

module.exports = function(RED: Red) {
  class ProxyConfig extends Node {
    proxy: SimulatorProxy;
    started: boolean = false;

    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      const readNode = RED.nodes.getNode(config.readServer) as MqttNode;
      const writeNode = RED.nodes.getNode(config.writeServer) as MqttNode;

      const readClient = connectToNode(readNode);
      const writeClient = connectToNode(writeNode);
      const messageQueue = new MessageQueue(writeClient, readClient);

      this.proxy = new SimulatorProxy(messageQueue);

      this.on("close", () => {
        this.proxy.end();
      });
    }

    start() {
      if (this.started) {
        return;
      }

      this.started = true;
      return this.proxy.start();
    }

    injectConfig(config: ReplaceConfig) {
      this.proxy.injectConfig(config);
    }
  }

  ProxyConfig.registerType(RED, "iot-sim-proxy-config");
};

export interface ProxyConfig extends Node {
  start: () => void;
  injectConfig: (config: ReplaceConfig) => void;
}