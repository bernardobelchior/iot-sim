import PromiseRouter from "express-promise-router";
import {
  ruleMiddleware,
  engineMiddleware,
  IRequest
} from "../rules-engine/rulesMiddleware";
import * as rulesController from "../rules-engine";
import Engine from "../rules-engine/Engine";

export function rulesRouter(rulesEngine: Engine) {
  const router = PromiseRouter();
  router.use(engineMiddleware(rulesEngine));

  router.get("/", async (req, res) => {
    await rulesController.getAll(req as IRequest, res);
  });

  router.get("/:id", async (req, res) => {
    await rulesController.getRule(req as IRequest, res);
  });

  router.post("/", ruleMiddleware, async (req, res) => {
    await rulesController.addRule(req as IRequest, res);
  });

  router.put("/:id", ruleMiddleware, async (req, res) => {
    await rulesController.updateRule(req as IRequest, res);
  });

  router.delete("/:id", async (req, res) => {
    await rulesController.deleteRule(req as IRequest, res);
  });

  return router;
}
