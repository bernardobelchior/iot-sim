import { Response } from "express";
import { IRequest } from "../registryMiddleware";

/**
 * Handle a GET request to /.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const list = (req: IRequest, res: Response) => {
  const things = req.registry.getThings();

  res.json(things.map(thing => thing.asThingDescription()));
};

/**
 * Handle a GET request to /<thingId>.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const get = (req: IRequest, res: Response) => {
  const thingId = req.params.thingId;
  const thing = req.registry.getThing(thingId);
  if (thing === null || thing === undefined) {
    res.status(404).end();
    return;
  }
  res.json(thing.asThingDescription());
};
