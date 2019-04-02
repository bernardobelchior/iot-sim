import { Response } from "express";
import { IRequest } from "../registryMiddleware";
import APIError from "../../util/APIError";
import { Thing } from "../models/Thing";

/**
 * Handle a GET request to /<thingId>/properties.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const list = (req: IRequest, res: Response) => {
  try {
    const thingId = req.params.thingId;
    const thing = req.registry.getThing(thingId);

    if (thing === undefined) {
      res
        .status(404)
        .send(new APIError(`Thing with ID '${thingId}' not found.`).toString());
      return;
    }

    res.json(thing.getProperties());
  } catch (e) {
    res
      .status(404)
      .send(new APIError("Failed to get thingId properties", e).toString());
  }
};

/**
 * Handle a GET request to /<thingId>/properties/<property>.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const get = (req: IRequest, res: Response) => {
  try {
    const thingId = Thing.getIdFromHref(req.params.thingId);
    const thing = req.registry.getThing(thingId);

    if (thing === undefined) {
      res
        .status(404)
        .send(new APIError(`Thing with ID '${thingId}' not found.`).toString());
      return;
    }

    const propertyName = req.params.propertyName;
    const propertyValue = thing.getPropertyValue(propertyName);
    res.json({ [propertyName]: propertyValue });
  } catch (e) {
    res
      .status(404)
      .send(new APIError("Failed to get thingId property", e).toString());
  }
};

/**
 * Handle a PUT request to /<thingId>/properties/<property>.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const put = (req: IRequest, res: Response) => {
  try {
    const thingId = req.params.thingId;
    const thing = req.registry.getThing(thingId);

    if (thing === undefined) {
      res
        .status(404)
        .send(new APIError(`Thing with ID '${thingId}' not found.`).toString());
      return;
    }

    const propertyName = req.params.propertyName;
    if (!req.body.hasOwnProperty(propertyName)) {
      res
        .status(400)
        .send(
          new APIError(
            "Failed to set thingId property",
            "Property identifier missing"
          ).toString()
        );
      return;
    }

    try {
      thing.setProperty(propertyName, req.body[propertyName]);
    } catch (error) {
      res
        .status(400)
        .send(new APIError("Failed to set thingId property", error).toString());
      return;
    }
    res.json({ [propertyName]: thing.getPropertyValue(propertyName) });
  } catch (e) {
    res
      .status(404)
      .send(new APIError("Failed to set thingId property", e).toString());
  }
};
