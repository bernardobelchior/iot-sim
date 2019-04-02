import { MessageQueue } from "../../src/api/MessageQueue";
import { SimulatedThingModel } from "./SimulatedThingModel";
import { Thing } from "../../src/api/models/Thing";

export class SimpleSimulatedSensor extends SimulatedThingModel {
  description = {
    "@type": ["Simulated"],
    name: "Thermometer",
    description: "A simulated web connected thermometer",
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
    let tmp = 10;

    setInterval(async () => {
      tmp += 0.5;

      await this.sendMessage("propertyStatus", { temperature: tmp });
    }, 1000);
  }

  getDescription(): object {
    return this.description;
  }
}
