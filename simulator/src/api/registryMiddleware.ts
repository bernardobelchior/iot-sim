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
