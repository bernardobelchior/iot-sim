import { NodeProperties, Red } from "node-red";
import { NRNode } from "./node-red-register";

module.exports = function(RED: Red) {
  class IoTSimConfig extends NRNode {
    constructor(config: NodeProperties) {
      super(RED, config);
    }

    updateWires(wires: any) {
      console.log(wires);
    }
  }

  IoTSimConfig.registerType(RED, "iot-sim-config");
};
