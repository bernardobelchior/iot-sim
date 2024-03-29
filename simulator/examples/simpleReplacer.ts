import { start } from "../src/server";
import { MessageQueue } from "../src/api/MessageQueue";
import { Window } from "./models/Window";
import { Thermometer } from "./models/Thermometer";
import { Proxy } from "../src/api/Proxy/Proxy";
import * as fs from "fs";
import { Config } from "../src/api/Proxy/Config";
import * as toml from "toml";

start().then(async ({ app }) => {
  const messageQueue: MessageQueue = app.get("messageQueue");

  const config = new Config(
    toml.parse(
      fs.readFileSync("./examples/configs/simpleReplacer.toml").toString()
    )
  );

  const proxy: Proxy = app.get("proxy");
  proxy.injectConfig(config);

  const actuator = new Window(messageQueue);
  const sensor = new Thermometer(messageQueue);

  await actuator.register();
  await sensor.register();

  sensor.measure();
  actuator.run();
});
