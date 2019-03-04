import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import mongo from "./config/mongo";
import expressValidator from "express-validator";
import cors from "cors";
import { vars } from "./util/vars";
import { DeviceRegistry } from "./api/DeviceRegistry";
import { messageQueueBuilder } from "./api/MessageQueue";
import { thingsRouter } from "./routes/things";

async function app() {
  const messageQueue = await messageQueueBuilder(vars.MQ_URI);
  const deviceRegistry = new DeviceRegistry(messageQueue);
  await deviceRegistry.initFromConfig();
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
  app.use("/things", thingsRouter(deviceRegistry));

  return app;
}

export default app;
