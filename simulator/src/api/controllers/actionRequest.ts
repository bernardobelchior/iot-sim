import { Thing } from "./thing";

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
  constructor(thing: Thing, actionId: string, input?: {}) {
    this.id = actionId;
    this.thing = thing;
    this.href = `/actions/${this.thing.name}/${this.id}`;
    this.status = ActionRequestStatus.created;
    this.timeRequested = new Date();
    this.input = input;

    this.thing.actionNotify(this.getActionRequest());
  }

  /**
   * 
   */
  getActionRequest(): any {
    let request: any = {
      [this.id]: {
        "href": this.href,
        "status": ActionRequestStatus[this.status],
        "timeRequested": this.timeRequested.toISOString()
      }
    }

    if(this.timeCompleted !== null) {
      request[this.id].timeCompleted = this.timeCompleted;
    }

    if(this.input !== null) {
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
    // remove from queue
  }
}