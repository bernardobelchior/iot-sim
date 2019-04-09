import { start } from "../src/server";
import { MessageQueue } from "../src/api/MessageQueue";
import { SimpleActuator } from "./models/SimpleActuator";
import { SimpleSensor } from "./models/SimpleSensor";
import { Proxy } from "../src/api/Proxy";
import * as fs from "fs";
import { ProxyConfig } from "../src/api/ProxyConfig";
import * as toml from "toml";

start().then(async ({ app }) => {
  const messageQueue: MessageQueue = app.get("messageQueue");

  const config = new ProxyConfig(
    toml.parse(
      fs.readFileSync("./examples/configs/simpleReplacer.toml").toString()
    )
  );

  const proxy: Proxy = app.get("proxy");
  proxy.injectConfig(config);

  const actuator = new SimpleActuator(messageQueue);
  const sensor = new SimpleSensor(messageQueue);

  await actuator.register();
  await sensor.register();

  sensor.measure();
  actuator.run();
});
