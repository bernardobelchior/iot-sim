import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import * as util from "util";
import * as vm from "vm";
import { Context, Script } from "vm";
import {
  createRunTestMessage,
  isResetTestMessage,
  isRunTestMessage
} from "../util";

interface Config extends NodeProperties {
  timeout: string;
}

module.exports = function(RED: Red) {
  class AwaitNode extends Node {
    timeoutId?: NodeJS.Timeout;
    lastMsg?: any;

    constructor(config: Config) {
      super(RED);

      this.createNode(config);
      const timeout = Number.parseInt(config.timeout);

      this.on("input", msg => {
        if (isResetTestMessage(msg)) {
          this.reset();
          this.send(msg);
          return;
        }

        if (isRunTestMessage(msg)) {
          this.timeoutId = setTimeout(() => {
            this.timeoutId = undefined;
            this.send(createRunTestMessage());
          }, timeout);
        } else {
          this.lastMsg = msg;
        }

        if (this.timeoutId && this.lastMsg) {
          const msg = this.lastMsg;
          this.reset();
          this.send(createRunTestMessage(msg.payload));
        }
      });

      this.on("close", () => {
        clearTimeout(this.timeoutId);
      });
    }

    private reset() {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
      this.lastMsg = undefined;
    }
  }

  AwaitNode.registerType(RED, "await");
};

export interface AwaitNode extends Node {}
