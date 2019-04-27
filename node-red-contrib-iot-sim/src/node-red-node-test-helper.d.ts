declare module "node-red-node-test-helper" {
  interface Helper {
    init: (nodeRed: any) => void;
    load: (nodes: Node[], flow: any[], cb: () => void) => void;
    unload: () => void;
  }

  const NodeTestHelper: Helper;

  export = NodeTestHelper;
}
