import express, { Express } from "express";
import compression from "compression";
import bodyParser from "body-parser";
import expressValidator from "express-validator";
import cors from "cors";
import { vars } from "./util/vars";
import { DeviceRegistry } from "./api/DeviceRegistry";
import { MessageQueue, messageQueueBuilder } from "./api/MessageQueue";
import * as routes from "./routes";
import { Proxy } from "./api/Proxy/Proxy";

type Settings = {
  messageQueue: MessageQueue;
  registry: DeviceRegistry;
  proxy: Proxy;
};

export interface IApp extends Express {
  settings: Settings;
}

async function app(): Promise<IApp> {
  const messageQueue = await messageQueueBuilder(
    vars.READ_MQ_URI,
    vars.WRITE_MQ_URI
  );
  const registry = new DeviceRegistry(messageQueue);
  await registry.init();
  const proxy = new Proxy(
    await messageQueueBuilder(vars.WRITE_MQ_URI, vars.READ_MQ_URI)
  );
  await proxy.start();

  // Create Express server
  const app = express();

  // Express configuration
  app.set("port", vars.PORT || 8080);
  app.set("messageQueue", messageQueue);
  app.set("registry", registry);
  app.set("proxy", proxy);

  app.use(compression());
  app.use(cors({ origin: "*" }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(expressValidator());

  app.use("/things", routes.thingsRouter(registry));

  return app;
}

export default app;
