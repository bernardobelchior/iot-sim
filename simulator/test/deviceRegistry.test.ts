import waitForExpect from "wait-for-expect";
import { messageQueueBuilder } from "../src/MessageQueue";
import { vars } from "../src/util/vars";
import DeviceRegistry from "../src/api/DeviceRegistry";

const things = [
  {
    name: "Lamp",
    description: "A web connected lamp",
    properties: {
      on: {
        title: "On/Off",
        type: "boolean",
        description: "Whether the lamp is turned on",
        links: [{ href: "/things/lamp/properties/on" }]
      }
    },
    id: "lamp"
  },
  {
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
    id: "window"
  }
];

describe("DeviceRegistry", () => {
  it("registers devices correctly", async () => {
    const messageQueue = await messageQueueBuilder(vars.MQ_URI);
    const deviceRegistry = new DeviceRegistry();
    await deviceRegistry.init();

    expect(Object.values(deviceRegistry.getThings())).toHaveLength(0);

    await messageQueue.publish("register", JSON.stringify(things[0]));
    await messageQueue.publish("register", JSON.stringify(things[1]));

    await waitForExpect(() =>
      expect(Object.values(deviceRegistry.getThings())).toHaveLength(2)
    );

    things.forEach(thing =>
      expect(
        deviceRegistry.getThing(thing.id)
      ).toBeTruthy()
    );

    await messageQueue.end();
  });
});