import { ThingModel } from "./ThingModel";
import { MessageQueue } from "../../src/api/MessageQueue";
import { Thing } from "../../src/api/models/Thing";

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
    id: "thermometer"
  };

  constructor(messageQueue: MessageQueue) {
    super(messageQueue);
  }

  getHref(): string {
    return Thing.generateHrefFromId(this.description.id);
  }

  measure() {
    let tmp = 20;

    setInterval(async () => {
      tmp += 0.1;

      await this.sendMessage("propertyStatus", { temperature: tmp });
    }, 1000);
  }

  getDescription(): object {
    return this.description;
  }
}
