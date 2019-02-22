import { messageQueueBuilder } from "./api/MessageQueue";
import { vars } from "./util/vars";

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

async function run() {
  const messageQueue = await messageQueueBuilder(vars.AMQP_URI);

  await messageQueue.init();
  await messageQueue.createExchange("registry", "direct");

  things.forEach(thing =>
    messageQueue.publish(
      "registry",
      "register",
      Buffer.from(JSON.stringify(thing))
    )
  );
}

run();