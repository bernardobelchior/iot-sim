import PromiseRouter from "express-promise-router";
import { rulesMiddleware, IRequest } from "../rules-engine/rulesMiddleware";
import * as rulesController from "../rules-engine";

export function rulesRouter() {
  const router = PromiseRouter();

  router.get("/", async (req, res) => {
    await rulesController.getAll(req, res);
  });

  router.get("/:id", async (req, res) => {
    await rulesController.getRule(req, res);
  });

  router.post("/", rulesMiddleware, async (req, res) => {
    await rulesController.addRule(req as IRequest, res);
  });

  router.put("/:id", rulesMiddleware, async (req, res) => {
    await rulesController.updateRule(req as IRequest, res);
  });

  router.delete("/:id", async (req, res) => {
    await rulesController.deleteRule(req as IRequest, res);
  });

  return router;
}
