import PromiseRouter from "express-promise-router";
import { DeviceRegistry } from "../api/DeviceRegistry";
import * as thingsController from "../api/controllers/things";
import * as propertiesController from "../api/controllers/properties";
import * as actionsController from "../api/controllers/actions";
import * as eventsController from "../api/controllers/events";
import { IRequest, registryMiddleware } from "../api/registryMiddleware";

export function thingsRouter(registry: DeviceRegistry) {
  const router = PromiseRouter();
  router.use(registryMiddleware(registry));

  router.get(
    "/",
    async (req, res) => await thingsController.list(req as IRequest, res)
  );
  router.post(
    "/",
    async (req, res) => await thingsController.create(req as IRequest, res)
  );
  router.get(
    "/:thingId",
    async (req, res) => await thingsController.get(req as IRequest, res)
  );
  router.get(
    "/:thingId/properties",
    async (req, res) => await propertiesController.list(req as IRequest, res)
  );
  router.get(
    "/:thingId/properties/:propertyName",
    async (req, res) => await propertiesController.get(req as IRequest, res)
  );
  router.put(
    "/:thingId/properties/:propertyName",
    async (req, res) => await propertiesController.put(req as IRequest, res)
  );
  router.get(
    "/:thingId/actions",
    async (req, res) => await actionsController.getActions(req as IRequest, res)
  );
  router.post(
    "/:thingId/actions",
    async (req, res) =>
      await actionsController.requestActions(req as IRequest, res)
  );
  router.get(
    "/:thingId/actions/:actionName",
    async (req, res) => await actionsController.getAction(req as IRequest, res)
  );
  router.post(
    "/:thingId/actions/:actionName",
    async (req, res) =>
      await actionsController.requestAction(req as IRequest, res)
  );
  router.get(
    "/:thingId/actions/:actionName/:actionId",
    async (req, res) =>
      await actionsController.getActionRequest(req as IRequest, res)
  );
  router.delete(
    "/:thingId/actions/:actionName/:actionId",
    async (req, res) =>
      await actionsController.cancelActionRequest(req as IRequest, res)
  );
  router.get(
    "/:thingId/events",
    async (req, res) => await eventsController.list(req as IRequest, res)
  );
  router.get(
    "/:thingId/events/:eventName",
    async (req, res) => await eventsController.get(req as IRequest, res)
  );

  return router;
}
