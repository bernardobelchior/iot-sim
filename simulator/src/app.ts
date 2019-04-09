import express, { Express } from "express";
import compression from "compression";
import bodyParser from "body-parser";
import expressValidator from "express-validator";
import cors from "cors";
import mongo from "./db/config";
import { vars } from "./util/vars";
import { DeviceRegistry } from "./api/DeviceRegistry";
import { MessageQueue, messageQueueBuilder } from "./api/MessageQueue";
import { Simulator } from "./Simulator";
import * as routes from "./routes";
import logger from "./util/logger";
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

  if (vars.ENVIRONMENT !== "test") {
    if (vars.MONGODB_URI !== "") {
      mongo();
    } else {
      logger.warn("MONGODB_URI not set. MongoDB initialization skipped");
    }
  }

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

  (await Simulator.getInstance()).setRegistry(registry);
  app.use("/things", routes.thingsRouter(registry));
  app.use(
    "/rules",
    routes.rulesRouter((await Simulator.getInstance()).getRulesEngine())
  );

  return app;
}

export default app;
