import { start } from "../src/server";
import { MessageQueue } from "../src/api/MessageQueue";

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

start().then(async ({ app }) => {
  const messageQueue: MessageQueue = app.get("messageQueue");

  await Promise.all(
    things.map(thing => messageQueue.publish("register", JSON.stringify(thing)))
  );
});
