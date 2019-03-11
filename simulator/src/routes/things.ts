import { Router } from "express";
import { DeviceRegistry } from "../api/DeviceRegistry";
import * as thingsController from "../api/controllers/things";
import * as propertiesController from "../api/controllers/properties";
import * as actionsController from "../api/controllers/actions";
import * as eventsController from "../api/controllers/events";
import { IRequest, registryMiddleware } from "../api/registryMiddleware";

export function thingsRouter(registry: DeviceRegistry) {
  const router = Router();
  router.use(registryMiddleware(registry));

  router.get("/", (req, res) => thingsController.list(req as IRequest, res));
  router.get("/:thingId", (req, res) =>
    thingsController.get(req as IRequest, res)
  );
  router.get("/:thingId/properties", (req, res) =>
    propertiesController.list(req as IRequest, res)
  );
  router.get("/:thingId/properties/:propertyName", (req, res) =>
    propertiesController.get(req as IRequest, res)
  );
  router.put("/:thingId/properties/:propertyName", (req, res) =>
    propertiesController.put(req as IRequest, res)
  );
  router.get("/:thingId/actions", (req, res) =>
    actionsController.getActions(req as IRequest, res)
  );
  router.post("/:thingId/actions", (req, res) =>
    actionsController.requestActions(req as IRequest, res)
  );
  router.get("/:thingId/actions/:actionName", (req, res) =>
    actionsController.getAction(req as IRequest, res)
  );
  router.post("/:thingId/actions/:actionName", (req, res) =>
    actionsController.requestAction(req as IRequest, res)
  );
  router.get("/:thingId/actions/:actionName/:actionId", (req, res) =>
    actionsController.getActionRequest(req as IRequest, res)
  );
  router.delete("/:thingId/actions/:actionName/:actionId", (req, res) =>
    actionsController.cancelActionRequest(req as IRequest, res)
  );
  router.get("/:thingId/events", (req, res) =>
    eventsController.list(req as IRequest, res)
  );
  router.get("/:thingId/events/:eventName", (req, res) =>
    eventsController.get(req as IRequest, res)
  );

  return router;
}
