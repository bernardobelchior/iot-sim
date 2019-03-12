import waitForExpect from "wait-for-expect";
import { messageQueueBuilder } from "./MessageQueue";
import { vars } from "../util/vars";
import { DeviceRegistry, REGISTER_TOPIC } from "./DeviceRegistry";
import { Thing } from "./models/Thing";
import { parseWebThing } from "./builder";

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
        await messageQueue.publish(REGISTER_TOPIC, JSON.stringify(thing))
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

  it("sets device property correctly", async () => {
    const thing = parseWebThing(things[0]);
    const message = {
      messageType: "setProperty",
      data: {
        on: true
      }
    };

    const messageQueue = await messageQueueBuilder(vars.MQ_URI);
    const deviceRegistry = new DeviceRegistry(messageQueue);
    await deviceRegistry.init();

    await deviceRegistry.addThing(thing);

    expect(thing.getPropertyValue("on")).toBeUndefined();

    await messageQueue.publish(thing.href, JSON.stringify(message));

    await waitForExpect(() =>
      expect(thing.getPropertyValue("on")).toBe(message.data.on)
    );

    await messageQueue.end();
  });
});
