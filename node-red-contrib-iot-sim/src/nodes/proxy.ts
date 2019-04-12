import { Node, NodeProperties, Red } from "node-red";
import { NRNode } from "../node-red-register";
import { MessageQueue, Proxy as SimulatorProxy } from "iot-simulator/dist/src";
import { AsyncClient, connect } from "async-mqtt";

interface ProxyConfig extends NodeProperties {
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
  class Proxy extends NRNode {
    proxy: SimulatorProxy;

    constructor(config: ProxyConfig) {
      super(RED, config);

      const readNode = RED.nodes.getNode(config.readServer) as MqttNode;
      const writeNode = RED.nodes.getNode(config.writeServer) as MqttNode;

      const readClient = connectToNode(readNode);
      const writeClient = connectToNode(writeNode);

      this.proxy = new SimulatorProxy(
        new MessageQueue(writeClient, readClient)
      );

      this.proxy.start();

      this.on("input", (msg: unknown) => {
        writeClient.publish(msg.topic, JSON.stringify(msg.payload));
      });
    }

    updateWires(wires: any) {
      console.log(wires);
    }
  }

  Proxy.registerType(RED, "proxy");
};
