import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import mongo from "./config/mongo";
import expressValidator from "express-validator";
import cors from "cors";
import { vars } from "./util/vars";

import { DeviceRegistry } from "./api/DeviceRegistry";
import { messageQueueBuilder } from "./api/MessageQueue";

(async () => {
  try {
    const messageQueue = await messageQueueBuilder(vars.MQ_URI);
    DeviceRegistry.setMessageQueue(messageQueue);
    await DeviceRegistry.init();
  } catch (error) {
    throw new Error(error);
  }
})();

mongo();

// Controllers
import * as thingsController from "./api/controllers/things";
import * as eventsController from "./api/controllers/events";
import * as actionsController from "./api/controllers/actions";
import * as propertiesController from "./api/controllers/properties";

// Create Express server
const app = express();

// Express configuration
app.set("port", vars.PORT || 8080);

app.use(compression());
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

/**
 * App routes.
 */
app.get("/", (req, res) => thingsController.list(req, res));
app.get("/:thingId", (req, res) => thingsController.get(req, res));
app.get("/:thingId/properties", (req, res) => propertiesController.get(req, res));
app.get("/:thingId/properties/:propertyName", (req, res) => propertiesController.get(req, res));
app.put("/:thingId/properties/:propertyName", (req, res) => propertiesController.put(req, res));
app.get("/:thingId/actions", (req, res) => actionsController.getActions(req, res));
app.post("/:thingId/actions", (req, res) => actionsController.requestActions(req, res));
app.get("/:thingId/actions/:actionName", (req, res) => actionsController.getAction(req, res));
app.post("/:thingId/actions/:actionName", (req, res) => actionsController.requestAction(req, res));
app.get("/:thingId/actions/:actionName/:actionId", (req, res) => actionsController.getActionRequest(req, res));
app.delete("/:thingId/actions/:actionName/:actionId", (req, res) => actionsController.cancelActionRequest(req, res));
app.get("/:thingId/events", (req, res) => eventsController.list(req, res));
app.get("/:thingId/events/:eventName", (req, res) => eventsController.get(req, res));

export default app;