import { ThingModel } from "./ThingModel";
import { MessageQueue } from "../../src/api/MessageQueue";

export class SimpleSimulatedSensor extends ThingModel {
  description = {
    type: ["Simulated"],
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
    href: "/things/thermometer"
  };

  constructor(messageQueue: MessageQueue) {
    super(messageQueue);
  }

  measure() {
    let tmp = 10;

    setInterval(async () => {
      tmp += 0.5;
      const msg = {
        messageType: "propertyStatus",
        data: {
          temperature: tmp
        }
      };

      await this.mq.publish("/things/thermometer", JSON.stringify(msg));
    }, 1000);
  }

  getDescription(): string {
    return JSON.stringify(this.description);
  }
}
