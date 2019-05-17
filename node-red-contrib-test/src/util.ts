type Command = "run";

export interface TestFailure {
  msg: any;
  function: string;
}

interface RunTestMsg extends TestMsg {
  test: {
    cmd: "run";
  };
}

interface TestMsg {
  payload?: any;
  test: {
    cmd: Command;
  };
}

export function createRunTestMessage(payload?: any): TestMsg {
  return {
    payload,
    test: {
      cmd: "run"
    }
  };
}

export function isRunTestMessage(msg: any): msg is RunTestMsg {
  return msg.test && msg.test.cmd === "run";
}
