import { messageQueueBuilder } from "./api/MessageQueue";

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
  }
};

async function run() {
  const messageQueue = await messageQueueBuilder(
    "amqp://guest:guest@172.23.0.3:5672/vhost"
  );

  await messageQueue.init();
  await messageQueue.createExchange("registry", "direct");
  messageQueue.publish(
    "registry",
    "register",
    Buffer.from(JSON.stringify(thing))
  );
}

run();
