import waitForExpect from "wait-for-expect";
import { MessageQueue } from "../src/api/MessageQueue";
import { DeviceRegistry, REGISTER_TOPIC } from "../src/api/DeviceRegistry";
import { Thing } from "../src/api/models/Thing";

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

const things: Thing[] = thingsDescription.map(desc => Thing.fromDescription(desc));

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
  let deviceRegistry: DeviceRegistry;
  let messageQueue: MessageQueue;

  beforeEach(async () => {
    deviceRegistry = new DeviceRegistry();
    await deviceRegistry.init();
    messageQueue = deviceRegistry.getMessageQueue() as MessageQueue;
  });

  afterAll(async () => {
    deviceRegistry.finalize();
  });


  it("registers devices correctly", async () => {
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

   it("sets device property correctly", async () => {
    const thing = things[0];
    await deviceRegistry.addThing(thing);

    const message = {
      messageType: "setProperty",
      data: {
        on: true
      }
    };

    expect(thing.getPropertyValue("on")).toBeUndefined();

    await messageQueue.publish(`/things/${thing.id}`, JSON.stringify(message));

    await waitForExpect(() =>
      expect(deviceRegistry.getThing(thing.id).getPropertyValue("on")).toBe(message.data.on)
    );
  });

  it("correctly overrides physical thing with a simulated one", async () => {
    const thing = things[0];
    await deviceRegistry.addThing(thing);
    expect(deviceRegistry.getThing(thing.id)!.type).not.toContain("Simulated");

    await deviceRegistry.addThing(simulatedThing);

    expect(deviceRegistry.getThing(thing.id).asThingDescription()).toEqual(simulatedThing.asThingDescription());
    expect(deviceRegistry.getThing(simulatedThing.id)!.type).toContain(
      "Simulated"
    );
  });

  it("correctly retrieves property of simulated device over the physical one", async () => {
    const thing = things[0];
    await deviceRegistry.addThing(thing);

    await messageQueue.publish(
      `/things/${thing.id}`,
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
      `/things/${simulatedThing.id}`,
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
