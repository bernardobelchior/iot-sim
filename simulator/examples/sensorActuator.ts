import { start } from "../src/server";
import { MessageQueue } from "../src/api/MessageQueue";
import { SimpleActuator } from "./models/SimpleActuator";
import { SimpleSensor } from "./models/SimpleSensor";

start().then(async ({ app }) => {
  const messageQueue: MessageQueue = app.get("messageQueue");

  const actuator = new SimpleActuator(messageQueue);
  const sensor = new SimpleSensor(messageQueue);

  await actuator.register();
  await sensor.register();

  await actuator.run();
  sensor.measure();
});
