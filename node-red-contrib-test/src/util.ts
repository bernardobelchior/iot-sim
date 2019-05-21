type Command = "run" | "reset";

export interface TestFailure {
  msg: any;
  function: string;
  error: Error;
  nodeId: string;
}

interface ResetTestMsg extends GenericTestMsg<"reset"> {}

interface RunTestMsg extends GenericTestMsg<"run"> {}

interface TestMsg extends GenericTestMsg<Command> {}

interface GenericTestMsg<Cmd extends Command> {
  payload?: any;
  _test: {
    cmd: Cmd;
  };
}

function createTestMessage(command: Command, payload?: any): TestMsg {
  return {
    payload,
    _test: {
      cmd: command
    }
  };
}

export function createResetTestMessage(): TestMsg {
  return createTestMessage("reset");
}

export function createRunTestMessage(payload?: any): TestMsg {
  return createTestMessage("run", payload);
}

export function isRunTestMessage(msg: any): msg is RunTestMsg {
  return msg._test && msg._test.cmd === "run";
}

export function isResetTestMessage(msg: any): msg is ResetTestMsg {
  return msg._test && msg._test.cmd === "reset";
}
