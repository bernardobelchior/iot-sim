import { NextFunction, Request, Response } from "express";
import Rule from "./Rule";
import APIError from "../util/APIError";

export interface IRequest extends Request {
  rule: Rule;
}

/**
 * Express middleware for extracting rules from the bodies of requests
 */
export const rulesMiddleware = (
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
