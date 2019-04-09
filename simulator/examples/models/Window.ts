import { ThingModel } from "./ThingModel";
import { MessageQueue, QoS } from "../../src/api/MessageQueue";
import { Thing } from "../../src/api/models/Thing";

export class Window extends ThingModel {
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
        links: [{ href: "/things/window/actions/close" }]
      }
    },
    id: "window"
  };

  open = true;

  constructor(messageQueue: MessageQueue) {
    super(messageQueue);
  }

  getHref(): string {
    return Thing.generateHrefFromId(this.description.id);
  }

  getDescription(): object {
    return this.description;
  }

  publishState() {
    return this.sendMessage("propertyStatus", {
      open: this.open
    });
  }

  onMessage(topic: string, msg: Buffer) {
    const data = JSON.parse(msg.toString()).data;

    if (this.open && data.temperature < 21) {
      this.open = false;
      this.publishState();
    }

    if (!this.open && data.temperature > 25) {
      this.open = true;
      this.publishState();
    }
  }

  async run() {
    await this.mq.subscribe(
      "/things/thermometer",
      this.onMessage.bind(this),
      QoS.AtLeastOnce
    );

    await this.publishState();
  }
}
