import Trigger from "./Trigger";

enum OperationTypes {
  AND = "AND",
  OR = "OR"
}

/**
 * A Trigger which activates only when a set of triggers are activated
 */
export default class MultiTrigger extends Trigger {
  op: OperationTypes;
  triggers: Trigger[];
  states: boolean[];
  state: boolean = false;

  constructor(label: string, op: string, triggers: Trigger[]) {
    super(label);
    if (!Object.values(OperationTypes).includes(op)) {
      throw Error("Operation type missing");
    }
    const operationIdx = op as keyof typeof OperationTypes;
    this.op = OperationTypes[operationIdx];
    this.triggers = triggers;

    this.states = new Array(this.triggers.length);
    for (let i = 0; i < this.states.length; i++) {
      this.states[i] = false;
    }
  }

  /**
   * @return {any}
   */
  toDescription(): any {
    return Object.assign(super.toDescription(), {
      op: this.op,
      triggers: this.triggers.map(trigger => trigger.toDescription())
    });
  }

  async start() {
    const starts = this.triggers.map((trigger, triggerIndex) => {
      trigger.on("stateChanged", this.onStateChanged.bind(this, triggerIndex));
      return trigger.start();
    });
    await Promise.all(starts);
  }

  stop() {
    this.triggers.forEach(trigger => {
      trigger.removeAllListeners("stateChanged");
      trigger.stop();
    });
  }

  onStateChanged(triggerIndex: number, state: { on: boolean, value?: any }) {
    this.states[triggerIndex] = state.on;

    let value = this.states[0];
    for (let i = 1; i < this.states.length; i++) {
      if (this.op === OperationTypes.AND) {
        value = value && this.states[i];
      } else if (this.op === OperationTypes.OR) {
        value = value || this.states[i];
      }
    }

    if (value !== this.state) {
      this.state = value;
      this.emit("stateChanged", { on: this.state });
    }
  }
}
