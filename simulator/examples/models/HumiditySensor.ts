import { ThingModel } from "./ThingModel";
import { MessageQueue } from "../../src/api/MessageQueue";
import { Thing } from "../../src/api/models/Thing";

export class HumiditySensor extends ThingModel {
  description = {
    name: "Humidity Sensor",
    description: "A web connected humidity sensor",
    properties: {
      humidity: {
        title: "Humidity",
        type: "float",
        unit: "%",
        description: "Humidity of the environment",
        links: [{ href: "/things/thermometer/properties/humidity" }]
      }
    },
    id: "humiditysensor"
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
}
