import { Request, Response } from "express";
import { IRequest } from "./rulesMiddleware";
import APIError from "../util/APIError";
import { EngineSingleton } from "./Engine";

export const getAll = async (req: Request, res: Response) => {
  try {
    const rules = Object.values(EngineSingleton.getRules());
    res.send(rules);
  } catch (error) {
    res
      .status(404)
      .send(new APIError("Engine failed to get rules", error).toString());
  }
};

export const getRule = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const rule = EngineSingleton.getRule(id);
    res.send(rule.toDescription());
  } catch (e) {
    res
      .status(404)
      .send(new APIError("Engine failed to get rule", e).toString());
  }
};

export const addRule = async (req: IRequest, res: Response) => {
  try {
    const ruleId = await EngineSingleton.addRule(req.rule);
    res.send({ id: ruleId });
  } catch (e) {
    res
      .status(404)
      .send(new APIError("Engine failed to add rule", e).toString());
  }
};

export const updateRule = async (req: IRequest, res: Response) => {
  try {
    await EngineSingleton.updateRule(req.params.id, req.rule);
    res.send({});
  } catch (e) {
    res
      .status(404)
      .send(new APIError("Engine failed to update rule", e).toString());
  }
};

export const deleteRule = async (req: Request, res: Response) => {
  try {
    EngineSingleton.deleteRule(req.params.id);
    res.send({});
  } catch (e) {
    res
      .status(404)
      .send(new APIError("Engine failed to delete rule", e).toString());
  }
};
