import { Response } from "express";
import { IRequest } from "../registryMiddleware";
import APIError from "../../util/APIError";

/**
 * Handle a GET request to /.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const list = (req: IRequest, res: Response) => {
  const things = Object.values(req.registry.getThings());
  res.json(things.map(thing => thing.asThingDescription()));
};

/**
 * Handle a GET request to /<thingId>.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const get = (req: IRequest, res: Response) => {
  try {
    const thingId = req.params.thingId;
    const thing = req.registry.getThing(thingId);

    if (thing === undefined) {
      res
        .status(404)
        .send(new APIError(`Thing with ID '${thingId}' not found.`).toString());
      return;
    }

    res.json(thing.asThingDescription());
  } catch (e) {
    res.status(404).send(new APIError("Failed to get thingId", e).toString());
  }
};

/**
 * Handle a POST request to /.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const create = async (req: IRequest, res: Response) => {
  try {
    if (!req.body.hasOwnProperty("id")) {
      res
        .status(400)
        .send(new APIError("Failed to add thingId", "ID missing").toString());
      return;
    }
    const thing = await req.registry.createThing(req.body.id, req.body);
    res.send({ id: thing.id });
  } catch (e) {
    res.status(404).send(new APIError("Failed to add thingId", e).toString());
  }
};
