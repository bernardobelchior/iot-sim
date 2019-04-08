import waitForExpect from "wait-for-expect";
import { MessageQueue, messageQueueBuilder } from "./MessageQueue";
import { DeviceRegistry, REGISTER_TOPIC } from "./DeviceRegistry";
import { Thing } from "./models/Thing";
import { vars } from "../util/vars";

const thingsDescription = [
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

const things: Thing[] = thingsDescription.map(desc =>
  Thing.fromDescription(desc)
);

const simulatedThing: Thing = Thing.fromDescription({
  "@type": ["Simulated"],
  name: "Lamp",
  description: "A simulated web connected lamp",
  properties: {
    on: {
      title: "On/Off",
      type: "integer",
      unit: "percent",
      description: "Percentage of light sent from the lamp",
      links: [{ href: "/things/lamp/properties/on" }]
    }
  },
  id: "lamp"
});

describe("DeviceRegistry", () => {
  let messageQueue: MessageQueue;
  let deviceRegistry: DeviceRegistry;

  beforeEach(async () => {
    messageQueue = await messageQueueBuilder(
      vars.READ_MQ_URI,
      vars.READ_MQ_URI
    );
    deviceRegistry = new DeviceRegistry(messageQueue);
    await deviceRegistry.init();
  });

  afterEach(async () => {
    await messageQueue.end();
  });

  it("should register devices", async () => {
    expect(Object.values(deviceRegistry.getThings())).toHaveLength(0);

    things.forEach(
      async thing =>
        await messageQueue.publish(
          REGISTER_TOPIC,
          JSON.stringify(thing.asThingDescription())
        )
    );

    await waitForExpect(() =>
      expect(Object.values(deviceRegistry.getThings())).toHaveLength(2)
    );

    things.forEach(thing =>
      expect(deviceRegistry.getThing(thing.id)).toBeTruthy()
    );
  });

  it("should set device property", async () => {
    const thing = things[0];
    const message = {
      messageType: "setProperty",
      data: {
        on: true
      }
    };

    await deviceRegistry.addThing(thing);

    expect(thing.getPropertyValue("on")).toBeUndefined();

    await messageQueue.publish(thing.href, JSON.stringify(message));

    await waitForExpect(() =>
      expect(deviceRegistry.getThing(thing.id)!.getPropertyValue("on")).toBe(
        message.data.on
      )
    );
  });

  it("should override physical thingId with a simulated one", async () => {
    const thing = things[0];
    await deviceRegistry.addThing(thing);
    expect(deviceRegistry.getThing(thing.id)!.type).not.toContain("Simulated");

    await deviceRegistry.addThing(simulatedThing);

    expect(deviceRegistry.getThing(thing.id)!.asThingDescription()).toEqual(
      simulatedThing.asThingDescription()
    );
    expect(deviceRegistry.getThing(simulatedThing.id)!.type).toContain(
      "Simulated"
    );
  });

  it("should retrieve property of simulated device over the physical one", async () => {
    const thing = things[0];
    await deviceRegistry.addThing(thing);

    await messageQueue.publish(
      thing.href,
      JSON.stringify({
        messageType: "setProperty",
        data: {
          on: false
        }
      })
    );

    await waitForExpect(() => expect(thing.getPropertyValue("on")).toBe(false));

    await deviceRegistry.addThing(simulatedThing);
    await messageQueue.publish(
      simulatedThing.href,
      JSON.stringify({
        messageType: "setProperty",
        data: {
          on: true
        }
      })
    );

    await waitForExpect(() =>
      expect(deviceRegistry.getThing(thing.id)!.getPropertyValue("on")).toBe(
        true
      )
    );
  });
});
