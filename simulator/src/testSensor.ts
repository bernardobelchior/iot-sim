import { messageQueueBuilder } from "./api/MessageQueue";
import { vars } from "./util/vars";

const thing = {
  name: "On/Off Switch",
  description: "A web connected switch",
  properties: {
    on: {
      title: "On/Off",
      type: "boolean",
      description: "Whether the lamp is turned on",
      links: [{ href: "/things/lamp/properties/on" }]
    }
  },
  href: "/things/lamp"
};

async function run() {
  const messageQueue = await messageQueueBuilder(vars.AMQP_URI);

  await messageQueue.init();
  await messageQueue.createExchange("registry", "direct");
  messageQueue.publish(
    "registry",
    "register",
    Buffer.from(JSON.stringify(thing))
  );
}

run();
