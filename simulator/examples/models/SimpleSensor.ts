import { ThingModel } from "./ThingModel";
import { MessageQueue } from "../../src/api/MessageQueue";

export class SimpleSensor extends ThingModel {
  description = {
    name: "Thermometer",
    description: "A web connected thermometer",
    properties: {
      temperature: {
        title: "Temperature",
        type: "float",
        unit: "celsius",
        description: "Temperature of the environment",
        links: [{ href: "/things/thermometer/properties/temperature" }]
      }
    },
    href: "/things/thermometer"
  };

  constructor(messageQueue: MessageQueue) {
    super(messageQueue);
  }

  getHref(): string {
    return this.description.href;
  }

  measure() {
    let tmp = 20;

    setInterval(async () => {
      tmp -= 0.1;

      await this.sendMessage("propertyStatus", { temperature: tmp });
    }, 1000);
  }

  getDescription(): object {
    return this.description;
  }
}
