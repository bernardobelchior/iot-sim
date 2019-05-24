import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import * as util from "util";
import * as vm from "vm";
import { Context, Script } from "vm";
import * as chai from "chai";
import {
  createRunTestMessage,
  isResetTestMessage,
  isRunTestMessage,
  TestFailure
} from "../util";

interface Config extends NodeProperties {
  func: string;
  noerr: number;
}

module.exports = function(RED: Red) {
  class AssertNode extends Node {
    outstandingTimers: number[] = [];
    outstandingIntervals: number[] = [];

    constructor(config: Config) {
      super(RED);

      this.createNode(config);
      this.reset();

      const script = this.createScript(config.func);
      const context = this.createContext();

      this.on("input", msg => {
        if (isResetTestMessage(msg)) {
          this.reset();
          this.send(msg);
          return;
        }

        if (!isRunTestMessage(msg)) {
          return;
        }

        try {
          this.runScript(script, context, msg);

          this.status({ fill: "green", shape: "ring", text: "passed" });
          this.send(createRunTestMessage());
        } catch (error) {
          console.log(error);
          this.status({ fill: "red", shape: "ring", text: "failed" });

          this.error(error);
          const failure: TestFailure = {
            function: config.func,
            error,
            msg,
            nodeId: config.id
          };

          this.context().flow.testRunner.testDone(failure);
        }
      });

      this.on("close", () => {
        this.outstandingIntervals.forEach(clearInterval);
        this.outstandingTimers.forEach(clearTimeout);
      });
    }

    private reset() {
      this.status({ fill: "yellow", shape: "ring", text: "pending" });
    }

    private runScript(script: Script, context: Context, msg: any): any {
      try {
        const start = process.hrtime();
        context.msg = msg;
        script.runInContext(context);

        const duration = process.hrtime(start);
        const converted =
          Math.floor((duration[0] * 1e9 + duration[1]) / 10000) / 100;

        this.metric("duration", msg, converted);

        return context.results;
      } catch (err) {
        // remove unwanted part
        const index = err.stack.search(/\n\s*at Script.runInContext/);
        err.stack = err.stack
          .slice(0, index)
          .split("\n")
          .slice(0, -1)
          .join("\n");

        // if (err.name === "AssertionError") {
        /* Remove information about where the error was thrown. */
        const [_, __, ___, ____, ...errStack] = err.stack.split("\n");

        /* Remove 1 from the error line. This is needed because the first line
         * is not written by the user, but is also not seen by them. */
        const lines = errStack.length;
        const lineToUpdate = errStack[lines - 1];

        const [_fullMatch, line, column]: string[] = /:(\d+):(\d+)$/.exec(
          lineToUpdate
        );

        const newLine = lineToUpdate.replace(
          /:(\d+):(\d+)$/,
          `:${Number.parseInt(line) - 1}:${column}`
        );

        err.stack = errStack
          .slice(0, -1)
          .concat([newLine])
          .join("\n");

        throw err;
        // }

        // const stack = err.stack.split(/\r?\n/);

        // // store the error in msg to be used in flows
        // msg.error = err;

        // let line = 0;
        // let errorMessage;
        // if (stack.length > 0) {
        //   while (
        //     line < stack.length &&
        //     stack[line].indexOf("ReferenceError") !== 0
        //   ) {
        //     line++;
        //   }

        //   if (line < stack.length) {
        //     errorMessage = stack[line];
        //     const m = /:(\d+):(\d+)$/.exec(stack[line + 1]);
        //     if (m) {
        //       const lineno = Number(m[1]) - 1;
        //       const cha = m[2];
        //       errorMessage += " (line " + lineno + ", col " + cha + ")";
        //     }
        //   }
        // }

        // if (!errorMessage) {
        //   errorMessage = err.toString();
        // }

        // this.error(errorMessage, msg);
      }
    }

    private createScript(functionText: string) {
      const fullFunctionText =
        "var results = null;" +
        "results = (function(msg){ " +
        "var __msgid__ = msg._msgid;" +
        "var node = {" +
        "id:__node__.id," +
        "name:__node__.name," +
        "log:__node__.log," +
        "error:__node__.error," +
        "warn:__node__.warn," +
        "debug:__node__.debug," +
        "trace:__node__.trace," +
        "on:__node__.on," +
        "status:__node__.status," +
        "};\n" +
        functionText +
        "\n" +
        "})(msg);";

      try {
        return new Script(fullFunctionText, {
          filename:
            "Assert node:" +
            this.id +
            (this.name ? " [" + this.name + "]" : ""), // filename for stack traces
          displayErrors: true
          // Using the following options causes node 4/6 to not include the line number
          // in the stack output. So don't use them.
          // lineOffset: -11, // line number offset to be used for stack traces
          // columnOffset: 0, // column number offset to be used for stack traces
        });
      } catch (e) {
        // eg SyntaxError - which v8 doesn't include line number information
        // so we can't do better than this
        this.error(e);
      }
    }

    private createContext(): Context {
      const node = this;
      chai.config.truncateThreshold = 1000;
      const expect = chai.expect;

      const sandbox: Context = {
        console: console,
        util: util,
        Buffer: Buffer,
        Date: Date,
        expect: expect,
        RED: {
          util: RED.util
        },
        __node__: {
          id: this.id,
          name: this.name,
          log: function() {
            this.log.apply(this, arguments);
          },
          error: function() {
            this.error.apply(this, arguments);
          },
          warn: function() {
            this.warn.apply(this, arguments);
          },
          debug: function() {
            this.debug.apply(this, arguments);
          },
          trace: function() {
            this.trace.apply(this, arguments);
          },
          on: function() {
            if (arguments[0] === "input") {
              // @ts-ignore
              throw new Error(RED._("function.error.inputListener"));
            }
            node.on.apply(node, arguments);
          },
          status: function() {
            node.status.apply(node, arguments);
          }
        },
        context: {
          set: function() {
            node.context().set.apply(node, arguments);
          },
          get: function() {
            return node.context().get.apply(node, arguments);
          },
          keys: function() {
            return node.context().keys.apply(node, arguments);
          },
          get global() {
            return node.context().global;
          },
          get flow() {
            return node.context().flow;
          }
        },
        flow: {
          set: function() {
            node.context().flow.set.apply(node, arguments);
          },
          get: function() {
            return node.context().flow.get.apply(node, arguments);
          },
          keys: function() {
            return node.context().flow.keys.apply(node, arguments);
          }
        },
        global: {
          set: function() {
            node.context().global.set.apply(node, arguments);
          },
          get: function() {
            return node.context().global.get.apply(node, arguments);
          },
          keys: function() {
            return node.context().global.keys.apply(node, arguments);
          }
        },
        env: {
          get: function(envVar: any) {
            // @ts-ignore
            const flow = node._flow;
            return flow.getSetting(envVar);
          }
        },
        setTimeout: function() {
          const func = arguments[0];
          let timerId: number;

          arguments[0] = function() {
            sandbox.clearTimeout(timerId);
            try {
              func.apply(this, arguments);
            } catch (err) {
              node.error(err, {});
            }
          };
          timerId = setTimeout.apply(this, arguments);
          node.outstandingTimers.push(timerId);
          return timerId;
        },
        clearTimeout: function(id: number) {
          clearTimeout(id);
          const index = node.outstandingTimers.indexOf(id);
          if (index > -1) {
            node.outstandingTimers.splice(index, 1);
          }
        },
        setInterval: function() {
          const func = arguments[0];
          let timerId: number;

          arguments[0] = function() {
            try {
              func.apply(this, arguments);
            } catch (err) {
              node.error(err, {});
            }
          };
          timerId = setInterval.apply(this, arguments);
          node.outstandingIntervals.push(timerId);
          return timerId;
        },
        clearInterval: function(id: number) {
          clearInterval(id);
          const index = node.outstandingIntervals.indexOf(id);
          if (index > -1) {
            node.outstandingIntervals.splice(index, 1);
          }
        }
      };

      if (util.hasOwnProperty("promisify")) {
        sandbox.setTimeout[util.promisify.custom] = function(
          after: any,
          value: any
        ) {
          return new Promise(function(resolve) {
            sandbox.setTimeout(function() {
              resolve(value);
            }, after);
          });
        };
      }

      return vm.createContext(sandbox);
    }
  }

  AssertNode.registerType(RED, "assert");
};

export interface AssertNode extends Node {}
