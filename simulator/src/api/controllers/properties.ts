import { Response } from "express";
import { IRequest } from "../registryMiddleware";

/**
 * Handle a GET request to /<thingId>/properties.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const list = async (req: IRequest, res: Response) => {
  const thingId = req.params.thingId;
  const thing = await req.registry.getThing(thingId);
  if (thing === null || thing === undefined) {
    res.status(404).end();
    return;
  }

  res.json(thing.getProperties());
};

/**
 * Handle a GET request to /<thingId>/properties/<property>.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const get = async (req: IRequest, res: Response) => {
  const thingId = req.params.thingId;
  const thing = await req.registry.getThing(thingId);
  if (thing === null || thing === undefined) {
    res.status(404).end();
    return;
  }

  const propertyName = req.params.propertyName;
  if (thing.hasProperty(propertyName)) {
    res.json({ [propertyName]: thing.getPropertyValue(propertyName) });
  } else {
    res.status(404).end();
  }
};

/**
 * Handle a PUT request to /<thingId>/properties/<property>.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const put = async (req: IRequest, res: Response) => {
  const thingId = req.params.thingId;
  const thing = await req.registry.getThing(thingId);
  if (thing === null || thing === undefined) {
    res.status(404).end();
    return;
  }

  const propertyName = req.params.propertyName;
  if (!req.body.hasOwnProperty(propertyName)) {
    res.status(400).end();
    return;
  }

  if (thing.hasProperty(propertyName)) {
    try {
      thing.setProperty(propertyName, req.body[propertyName]);
    } catch (e) {
      res.status(400).end();
      return;
    }

    res.json({ [propertyName]: thing.getPropertyValue(propertyName) });
  } else {
    res.status(404).end();
  }
};
