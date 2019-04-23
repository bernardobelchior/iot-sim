import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { AsyncClient, connect } from "async-mqtt";
import {
  Config as ProxyConfig,
  MessageQueue,
  Proxy as SimulatorProxy,
  ReplacerInput,
  ReplacerOutput
} from "iot-simulator";
import { GeneratorInput, GeneratorOutput } from "iot-simulator";

interface Config extends NodeProperties {
  readQueue: string;
  writeQueue: string;
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
  class ProxyConfigNode extends Node {
    proxy: SimulatorProxy;
    started: boolean = false;

    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      const readNode = RED.nodes.getNode(config.readQueue) as MqttNode;
      const writeNode = RED.nodes.getNode(config.writeQueue) as MqttNode;

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

    addReplacer(input: ReplacerInput, output: ReplacerOutput) {
      this.proxy.injectConfig(
        new ProxyConfig({
          replacers: [
            {
              input,
              outputs: [output]
            }
          ]
        })
      );
    }

    addGenerator(input: GeneratorInput, output: GeneratorOutput) {
      this.proxy.injectConfig(
        new ProxyConfig({
          generators: [
            {
              input,
              outputs: [output]
            }
          ]
        })
      );
    }
  }

  ProxyConfigNode.registerType(RED, "iot-sim-proxy-config");
};

export interface ProxyConfigNode extends Node {
  start: () => void;
  addReplacer: (input: ReplacerInput, output: ReplacerOutput) => void;
  addGenerator: (input: GeneratorInput, output: GeneratorOutput) => void;
}
