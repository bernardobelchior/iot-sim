import { Red, Node, NodeProperties } from "node-red";

/**
 * node-red Node
 */
export abstract class NRNode {
  red: Red;

  protected constructor(RED: Red, config: NodeProperties) {
    this.red = RED;

    this.red.nodes.createNode((this as unknown) as Node, config);
  }

  static registerType(RED: Red, type: string, opts?: any) {
    RED.nodes.registerType(
      type,
      (this as any).prototype.constructor as any,
      opts
    );
  }
}

export interface NRNode extends Node {}
