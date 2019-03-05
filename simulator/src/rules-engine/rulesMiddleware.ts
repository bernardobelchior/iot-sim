import { NextFunction, Request, RequestHandler, Response } from "express";
import { DeviceRegistry } from "./DeviceRegistry";

export interface IRequest extends Request {
  registry: DeviceRegistry;
}

/**
 * Express middleware that adds a DeviceRegistry to the request object.
 * @param registry Registry to insert in the request.
 */
export const registryMiddleware = (
  registry: DeviceRegistry
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): any => {
    (req as IRequest).registry = registry;
    next();
  };
};

/**
 * Express middleware for extracting rules from the bodies of requests
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
function parseRuleFromBody(req, res, next) {
  if (!req.body.trigger) {
    res.status(400).send(new APIError("No trigger provided").toString());
    return;
  }
  if (!req.body.effect) {
    res.status(400).send(new APIError("No effect provided").toString());
    return;
  }

  let rule = null;
  try {
    rule = Rule.fromDescription(req.body);
  } catch (e) {
    res.status(400).send(new APIError("Invalid rule", e).toString());
    return;
  }
  req.rule = rule;
  next();
}