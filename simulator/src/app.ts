import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import mongo from "./db/config";
import expressValidator from "express-validator";
import cors from "cors";
import { vars } from "./util/vars";
import { DeviceRegistrySingleton } from "./api/DeviceRegistry";
import { messageQueueBuilder } from "./api/MessageQueue";
import * as routes from "./routes";

async function app() {
  const messageQueue = await messageQueueBuilder(vars.MQ_URI);
  await DeviceRegistrySingleton.init();

  mongo();

  // Create Express server
  const app = express();

  // Express configuration
  app.set("port", vars.PORT || 8080);

  app.use(compression());
  app.use(cors({ origin: "*" }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(expressValidator());

  /* Web Thing REST API is exposed on /things/ so that other endpoints can be used for other purposes */
  app.use("/things", routes.thingsRouter(DeviceRegistrySingleton));
  app.use("/rules", routes.rulesRouter());

  return app;
}

export default app;
