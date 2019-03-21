import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import expressValidator from "express-validator";
import cors from "cors";
import mongo from "./db/config";
import { vars } from "./util/vars";
import { SimulatorSingleton } from "./Simulator";
import * as routes from "./routes";

async function app() {
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

  app.use("/things", routes.thingsRouter(SimulatorSingleton.getRegistry()));
  app.use("/rules", routes.rulesRouter(SimulatorSingleton.getRulesEngine()));

  await SimulatorSingleton.init();

  return app;
}

export default app;
