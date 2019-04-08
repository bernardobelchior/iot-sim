import { ThingModel } from "./ThingModel";
import { MessageQueue, QoS } from "../../src/api/MessageQueue";
import { Thing } from "../../src/api/models/Thing";

export class SimpleActuator extends ThingModel {
  description = {
    name: "Window",
    description: "A web connected window",
    properties: {
      open: {
        title: "Open/Closed",
        type: "boolean",
        description: "Whether the window is open or closed",
        links: [{ href: "/things/window/properties/open" }]
      }
    },
    actions: {
      close: {
        title: "Close",
        description: "Close window",
        input: {
          type: "null"
        },
        links: [{ href: "/things/window/actions/close" }]
      }
    },
    id: "window"
  };

  constructor(messageQueue: MessageQueue) {
    super(messageQueue);
  }

  getHref(): string {
    return Thing.generateHrefFromId(this.description.id);
  }

  getDescription(): object {
    return this.description;
  }

  onMessage(topic: string, msg: Buffer) {
    const data = JSON.parse(msg.toString()).data;

    if (data.temperature > 21) {
      console.log("too high!");
    }
  }

  async run() {
    await this.mq.subscribe(
      "/things/thermometer",
      this.onMessage.bind(this),
      QoS.AtLeastOnce
    );
  }
}
