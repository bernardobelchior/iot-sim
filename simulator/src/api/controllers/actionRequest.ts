enum ActionRequestStatus {
  "created",
  "pending",
  "completed"
}

export class ActionRequest {
  id: string;
  thingId: string;
  href: string;
  status: ActionRequestStatus;
  timeRequested: Date;
  timeCompleted?: Date;
  input?: {};

  constructor(thingId: string, actionId: string, input?: {}) {
    this.id = actionId;
    this.thingId = thingId;
    this.href = `/actions/${this.thingId}/${this.id}`;
    this.status = ActionRequestStatus.created;
    this.timeRequested = new Date();
    this.input = input;
  }

  getActionRequest(): any {
    let data:any = {
      [this.id]: {
        "href": this.href,
        "status": this.status,
        "timeRequested": this.timeRequested
      }
    }

    if(this.timeCompleted !== null) {
      data[this.id].timeCompleted = this.timeCompleted;
    }

    if(this.input !== null) {
      data[this.id].input = this.input;
    }

    return data;
  }
}