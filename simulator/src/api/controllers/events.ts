import { Response } from "express";
import { IRequest } from "../registryMiddleware";

/**
 * Handle a GET request to /<thingId>/events.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const list = (req: IRequest, res: Response) => {
  const thingId = req.params.thingId;
  const thing = req.registry.getThing(thingId);
  if (thing === null || thing === undefined) {
    res.status(404).end();
    return;
  }

  res.json(thing.getEventDescriptions());
};

/**
 * Handle a GET request to /<thingId>/events/<event>.
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
  const eventName = req.params.eventName;
  res.json(thing.getEventDescriptions(eventName));
};
