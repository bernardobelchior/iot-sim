import { messageQueueBuilder } from "../src/api/MessageQueue";
import { vars } from "../src/util/vars";
import { start } from "../src/server";

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

start().then(async server => {
  const messageQueue = await messageQueueBuilder(vars.MQ_URI);

  things.forEach(async thing =>
    console.log(await messageQueue.publish("register", JSON.stringify(thing)))
  );

  await messageQueue.end();
});
