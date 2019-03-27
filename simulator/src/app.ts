import express, { Express } from "express";
import compression from "compression";
import bodyParser from "body-parser";
import mongo from "./db/config";
import expressValidator from "express-validator";
import cors from "cors";
import { vars } from "./util/vars";
import { DeviceRegistry } from "./api/DeviceRegistry";
import { MessageQueue, messageQueueBuilder } from "./api/MessageQueue";
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

  /* Web Thing REST API is exposed on /things/ so that other endpoints can be used for other purposes */
  app.use("/things", routes.thingsRouter(deviceRegistry));
  app.use("/rules", routes.rulesRouter());

  return app;
}

export default app;
