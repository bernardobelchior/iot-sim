import { Response, Request } from "express";
import { DeviceRegistry } from "../DeviceRegistry";

/**
 * Handle a GET request to /.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const list = (req: Request, res: Response) => {
  const things = DeviceRegistry.getThings();

  res.json(
    things.map((thing) => thing.asThingDescription())
  );
};

/**
 * Handle a GET request to /<thingId>.
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
  res.json(thing.asThingDescription());
};