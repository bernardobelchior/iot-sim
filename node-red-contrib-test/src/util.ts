type Command = "run" | "reset";

export interface TestFailure {
  msg: any;
  function: string;
}

interface ResetTestMsg extends GenericTestMsg<"reset"> {}

interface RunTestMsg extends GenericTestMsg<"run"> {}

interface TestMsg extends GenericTestMsg<Command> {}

interface GenericTestMsg<Cmd extends Command> {
  payload?: any;
  test: {
    cmd: Cmd;
  };
}

function createTestMessage(command: Command, payload?: any): TestMsg {
  return {
    payload,
    test: {
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
  return msg.test && msg.test.cmd === "run";
}

export function isResetTestMessage(msg: any): msg is ResetTestMsg {
  return msg.test && msg.test.cmd === "reset";
}
