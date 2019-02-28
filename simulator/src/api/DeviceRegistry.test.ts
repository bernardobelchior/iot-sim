import waitForExpect from "wait-for-expect";
import { messageQueueBuilder } from "./MessageQueue";
import { vars } from "../util/vars";
import { DeviceRegistry } from "./DeviceRegistry";
import { Thing } from "./models/Thing";

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
    href: "/things/lamp"
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
    href: "/things/window"
  }
];

describe("DeviceRegistry", () => {
  it("registers devices correctly", async () => {
    const messageQueue = await messageQueueBuilder(vars.MQ_URI);
    const deviceRegistry = new DeviceRegistry(messageQueue);
    await deviceRegistry.init();

    expect(Object.values(deviceRegistry.getThings())).toHaveLength(0);

    things.forEach(
      async thing =>
        await messageQueue.publish("register", JSON.stringify(thing))
    );

    await waitForExpect(() =>
      expect(Object.values(deviceRegistry.getThings())).toHaveLength(2)
    );

    things.forEach(thing =>
      expect(
        deviceRegistry.getThing(Thing.generateIdFromHref(thing.href))
      ).toBeTruthy()
    );

    await messageQueue.end();
  });
});
