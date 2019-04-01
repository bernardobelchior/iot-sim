import express, { Express } from "express";
import compression from "compression";
import bodyParser from "body-parser";
import expressValidator from "express-validator";
import cors from "cors";
import mongo from "./db/config";
import { vars } from "./util/vars";
import { DeviceRegistry } from "./api/DeviceRegistry";
import { MessageQueue, messageQueueBuilder } from "./api/MessageQueue";
import { SimulatorSingleton } from "./Simulator";
import * as routes from "./routes";

type Settings = {
  messageQueue: MessageQueue;
  registry: DeviceRegistry;
};

export interface IApp extends Express {
  settings: Settings;
}

async function app(): Promise<IApp> {
  const messageQueue = await messageQueueBuilder(
    vars.READ_MQ_URI,
    vars.WRITE_MQ_URI
  );
  const deviceRegistry = new DeviceRegistry(messageQueue);
  await deviceRegistry.init();

  mongo();

  // Create Express server
  const app = express();

  // Express configuration
  app.set("port", vars.PORT || 8080);
  app.set("messageQueue", messageQueue);
  app.set("registry", deviceRegistry);

  app.use(compression());
  app.use(cors({ origin: "*" }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(expressValidator());

  const registry = SimulatorSingleton.getRegistry();

  app.use("/things", routes.thingsRouter(registry));
  app.use("/rules", routes.rulesRouter(SimulatorSingleton.getRulesEngine()));

  app.set("messageQueue", registry.getMessageQueue());
  app.set("registry", registry);

  await SimulatorSingleton.init();

  return app;
}

export default app;
