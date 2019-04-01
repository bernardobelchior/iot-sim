import { start } from "../src/server";
import { MessageQueue } from "../src/api/MessageQueue";
import { DeviceRegistry } from "../src/api/DeviceRegistry";
import { Thing } from "../src/api/models/Thing";

const things = [
  {
    name: "Lamp",
    description: "A web connected lamp",
    properties: {
      on: {
        title: "On/Off",
        type: "integer",
        unit: "percent",
        description: "Percentage of light sent from the lamp",
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

start().then(async ({ app }) => {
  const messageQueue: MessageQueue = app.get("messageQueue");
  const registry: DeviceRegistry = app.get("registry");

  await registry.addThing(Thing.fromDescription(things[0]));
  await registry.addThing(Thing.fromDescription(things[1]));

  await messageQueue.publish(
    things[0].href,
    JSON.stringify({ messageType: "setProperty", data: { on: 87 } })
  );

  await messageQueue.publish(
    things[1].href,
    JSON.stringify({ messageType: "setProperty", data: { open: true } })
  );
});
