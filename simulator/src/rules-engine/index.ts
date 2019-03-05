import { Response } from "express";
import { IRequest } from "./rulesMiddleware";
import APIError from "../util/APIError";
import Database from "./Database";
import Engine from "./Engine";
import Rule from "./Rule";

const engine = new Engine();

export const getAll = async (req: IRequest, res: Response) => {
  try {
    const rules = await engine.getRules();
    res.send(
      rules.map((rule: Rule) => {
        return rule.toDescription();
      })
    );
  } catch (error) {
    res
      .status(404)
      .send(new APIError("Engine failed to get rules", error).toString());
  }
};


index.get("/:id", async function (req, res) {
  try {
    const id = parseInt(req.params.id);
    const rule = await engine.getRule(id);
    res.send(rule.toDescription());
  } catch (e) {
    res
      .status(404)
      .send(new APIError("Engine failed to get rule", e).toString());
  }
});

index.post("/", parseRuleFromBody, async function (req, res) {
  const ruleId = await engine.addRule(req.rule);
  res.send({ id: ruleId });
});

index.put("/:id", parseRuleFromBody, async function (req, res) {
  try {
    await engine.updateRule(parseInt(req.params.id), req.rule);
    res.send({});
  } catch (e) {
    res
      .status(404)
      .send(new APIError("Engine failed to update rule", e).toString());
  }
});

index.delete("/:id", async function (req, res) {
  try {
    await engine.deleteRule(req.params.id);
    res.send({});
  } catch (e) {
    res
      .status(404)
      .send(new APIError("Engine failed to delete rule", e).toString());
  }
});

index.configure = async function () {
  await Database.open();
  await engine.getRules();
};