import { NextFunction, Request, Response } from "express";
import Rule from "./Rule";
import Engine from "./Engine";
import APIError from "../util/APIError";
import { RequestHandler } from "express-serve-static-core";

export interface IRequest extends Request {
  rule: Rule;
  engine: Engine;
}

/**
 * Express middleware for extracting the rule engine from the bodies of requests
 */
export const engineMiddleware = (engine: Engine): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): any => {
    (req as IRequest).engine = engine;
    next();
  };
};

/**
 * Express middleware for extracting rules from the bodies of requests
 */
export const ruleMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  if (!req.body.trigger) {
    res.status(400).send(new APIError("No trigger provided").toString());
    return;
  }
  if (!req.body.effect) {
    res.status(400).send(new APIError("No effect provided").toString());
    return;
  }

  let rule = undefined;
  try {
    rule = Rule.fromDescription(req.body);
  } catch (e) {
    res.status(400).send(new APIError("Invalid rule", e).toString());
    return;
  }
  (req as IRequest).rule = rule;
  next();
};
