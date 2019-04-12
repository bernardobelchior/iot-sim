import { NodeProperties, Red } from "node-red";
import { NRNode } from "./node-red-register";

module.exports = function(RED: Red) {
  class Replacer extends NRNode {
    constructor(config: NodeProperties) {
      super(RED, config);

      console.log(config);

      this.on("input", function(msg) {
        console.log(msg);
      });
    }
  }

  Replacer.registerType(RED, "replacer");
};
