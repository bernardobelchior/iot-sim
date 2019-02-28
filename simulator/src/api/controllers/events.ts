import { Response, Request } from "express";
import { DeviceRegistry } from "../DeviceRegistry";

/**
 * Handle a GET request to /<thingId>/events.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const list = (req: Request, res: Response) => {
  const thingId = req.params.thingId;
  const thing = DeviceRegistry.getThing(thingId);
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
export const get = (req: Request, res: Response) => {
  const thingId = req.params.thingId;
  const thing = DeviceRegistry.getThing(thingId);
  if (thing === null || thing === undefined) {
    res.status(404).end();
    return;
  }
  const eventName = req.params.eventName;
  res.json(thing.getEventDescriptions(eventName));
};
