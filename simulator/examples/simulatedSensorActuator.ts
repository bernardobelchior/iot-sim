import { start } from "../src/server";
import { MessageQueue } from "../src/api/MessageQueue";
import { SimpleActuator } from "./models/SimpleActuator";
import { SimpleSensor } from "./models/SimpleSensor";
import { SimpleSimulatedSensor } from "./models/SimpleSimulatedSensor";
import { proxyBuilder } from "../src/api/Proxy";
import { DeviceRegistry } from "../src/api/DeviceRegistry";

start().then(async ({ app }) => {
  const messageQueue: MessageQueue = app.get("messageQueue");
  const registry: DeviceRegistry = app.get("registry");

  const proxy = await proxyBuilder(registry, messageQueue);
  const actuator = new SimpleActuator(messageQueue);
  const sensor = new SimpleSensor(messageQueue);
  const simulatedSensor = new SimpleSimulatedSensor(messageQueue);

  await proxy.start();
  await actuator.register();
  await sensor.register();

  await actuator.run();
  sensor.measure();

  await simulatedSensor.register();

  simulatedSensor.measure();
});
