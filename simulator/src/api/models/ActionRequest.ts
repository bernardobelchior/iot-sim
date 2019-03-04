import { Thing } from "./Thing";
import { v4 as uuid } from "uuid";

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
  timeRequested: Date;
  timeCompleted?: Date;
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
    this.href = `/actions/${this.name}/${this.id}`;
    this.status = ActionRequestStatus.created;
    this.timeRequested = new Date();
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
        timeRequested: this.timeRequested.toISOString()
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
    this.timeCompleted = new Date();
    this.status = ActionRequestStatus.completed;
    this.thing.actionNotify(this.getActionRequest());
  }
}
