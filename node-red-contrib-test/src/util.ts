export function createRunTestMessage(): { payload: any } {
  return {
    payload: {
      cmd: "run"
    }
  };
}

export function isRunTestMessage(msg: any): boolean {
  return msg.payload && msg.payload.cmd === "run";
}
