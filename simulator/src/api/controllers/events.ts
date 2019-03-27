import { Response } from "express";
import { IRequest } from "../registryMiddleware";
import APIError from "../../util/APIError";

/**
 * Handle a GET request to /<thingId>/events.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const list = async (req: IRequest, res: Response) => {
  try {
    const thingId = req.params.thingId;
    const thing = req.registry.getThing(thingId);
    res.json(thing.getEventsDispatched());
  } catch (e) {
    res.status(404).send(new APIError(`Failed to cancel action`, e).toString());
  }
};

/**
 * Handle a GET request to /<thingId>/events/<event>.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const get = async (req: IRequest, res: Response) => {
  try {
    const thingId = req.params.thingId;
    const thing = req.registry.getThing(thingId);
    const eventName = req.params.eventName;
    res.json(thing.getEventsDispatched(eventName));
  } catch (e) {
    res.status(404).send(new APIError(`Failed to cancel action`, e).toString());
  }
};
