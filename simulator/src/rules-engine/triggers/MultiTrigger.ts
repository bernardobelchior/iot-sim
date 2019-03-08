import assert from "assert";
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

  constructor(label: string, op: OperationTypes, triggers: Trigger[]) {
    super(label);
    assert(op in OperationTypes);
    this.op = op;
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
      // trigger.on("stateChanged", this.onStateChanged.bind(this, triggerIndex));
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

  onStateChanged(triggerIndex: number, state: boolean) {
    this.states[triggerIndex] = state;

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
