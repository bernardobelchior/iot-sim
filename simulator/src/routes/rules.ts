import PromiseRouter from "express-promise-router";
import rulesMiddleware from '../rules-engine/rulesMiddleware';
import rulesController from '../rules-engine';

export function rulesRouter() {
  const router = PromiseRouter();
  router.use(rulesMiddleware());

  router.post("/", async (req, res) => {
    await rulesController.getAll(req, res);
  });

  return router;
}
