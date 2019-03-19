import { Router } from "express";
import DeviceRegistry from "../api/DeviceRegistry";
import { IRequest, registryMiddleware } from "../api/registryMiddleware";
import * as simulationController from "../api/controllers/simulation";

export function simulateRouter(registry: DeviceRegistry) {
  const router = Router();
  router.use(registryMiddleware(registry));

  router.post("simulate/:id", (req, res) => {
    simulationController.post(req as IRequest, res);
  });

  return router;
}
