import { Thing } from "./Thing";
import { v4 as uuid } from "uuid";
import { timestamp } from "./ValueGenerator";

/**
 *
 */
enum ActionRequestStatus {
  "created",
  "pending",
  "completed",
  "cancelled"
}

/**
 *
 */
export class ActionRequest {
  id: string;
  name: string;
  thing: Thing;
  href: string;
  status: ActionRequestStatus;
  timeRequested: string;
  timeCompleted?: string;
  input?: {};

  /**
   *
   * @param thing
   * @param actionId
   * @param input
   */
  constructor(thing: Thing, name: string, input?: {}) {
    this.name = name;
    this.id = uuid();
    this.thing = thing;
    this.href = `actions/${this.name}/${this.id}`;
    this.status = ActionRequestStatus.created;
    this.timeRequested = timestamp();
    this.input = input;

    this.thing.actionNotify(this.getActionRequest());
  }

  /**
   *
   */
  getActionRequest(): any {
    const request: any = {
      [this.id]: {
        href: this.href,
        status: ActionRequestStatus[this.status],
        timeRequested: this.timeRequested
      }
    };

    if (this.timeCompleted !== null) {
      request[this.id].timeCompleted = this.timeCompleted;
    }

    if (this.input !== null) {
      request[this.id].input = this.input;
    }

    return request;
  }

  /**
   *
   */
  startAction() {
    this.status = ActionRequestStatus.pending;
    this.thing.actionNotify(this.getActionRequest());
    this.performAction();
  }

  /**
   *
   */
  performAction() {
    // Do something according to input.
    this.finishAction();
  }

  /**
   *
   */
  cancelAction() {
    this.status = ActionRequestStatus.cancelled;
    this.thing.actionNotify(this.getActionRequest());
  }

  /**
   *
   */
  finishAction() {
    this.timeCompleted = timestamp();
    this.status = ActionRequestStatus.completed;
    this.thing.actionNotify(this.getActionRequest());
  }
}
