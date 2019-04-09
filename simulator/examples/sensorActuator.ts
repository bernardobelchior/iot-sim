import { start } from "../src/server";
import { MessageQueue } from "../src/api/MessageQueue";
import { SimpleActuator } from "./models/SimpleActuator";
import { SimpleSensor } from "./models/SimpleSensor";
import { Proxy } from "../src/api/Proxy";

start().then(async ({ app }) => {
  const messageQueue: MessageQueue = app.get("messageQueue");

  const proxy = new Proxy(
    new MessageQueue(messageQueue.writeClient, messageQueue.readClient)
  );

  const actuator = new SimpleActuator(messageQueue);
  const sensor = new SimpleSensor(messageQueue);

  await proxy.start();
  await actuator.register();
  await sensor.register();

  sensor.measure();
  actuator.run();
});
