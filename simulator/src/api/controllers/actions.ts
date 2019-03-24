import { Response } from "express";
import { IRequest } from "../registryMiddleware";
import APIError from "../../util/APIError";

/**
 * Handle a GET request to /<thingId>/actions.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const getActions = async (req: IRequest, res: Response) => {
  try {
    const thingId = req.params.thingId;
    const thing = req.registry.getThing(thingId);
    res.json(thing.getActionRequests());
  } catch (e) {
    res.status(404).send(new APIError(`Failed to get thing actions`, e).toString());
  }
};

/**
 * Handle a POST request to /<thingId>/actions.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const requestActions = async (req: IRequest, res: Response) => {
  try {
    const thingId = req.params.thingId;
    const thing = req.registry.getThing(thingId);
    const response: any = {};
    const requests: { actionName: string, input?: any }[] = [];
    for (const actionName in req.body) {
      let input = undefined;
      if (req.body[actionName].hasOwnProperty("input")) {
        input = req.body[actionName].input;
      }
      const isValid = thing.checkActionRequest(actionName, input);
      if (isValid) {
        requests.push({ actionName, input });
      } else {
        res.status(400).send(new APIError(`Action ${actionName} is invalid`).toString());
      }
    }

    requests.forEach(ar => {
      const actionRequest = thing.requestAction(ar.actionName, ar.input);
      Object.assign(response, actionRequest.getActionRequest());
    });

    res.status(201);
    res.json(response);

  } catch (e) {
    res.status(404).send(new APIError(`Failed to request an action`, e).toString());
  }
};

/**
 * Handle a GET request to /<thingId>/actions/<action_name>.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const getAction = async (req: IRequest, res: Response) => {
  try {
    const thingId = req.params.thingId;
    const thing = req.registry.getThing(thingId);
    const actionName = req.params.actionName;
    res.json(thing.getActionRequests(actionName));
  } catch (e) {
    res.status(404).send(new APIError(`Failed to get thing actions`, e).toString());
  }
};

/**
 * Handle a POST request to /<thingId>/actions/<action_name>.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const requestAction = async (req: IRequest, res: Response) => {
  try {
    const thingId = req.params.thingId;
    const thing = req.registry.getThing(thingId);
    const response: any = {};

    const actionName = req.params.actionName;
    let input = undefined;
    if (req.body[actionName].hasOwnProperty("input")) {
      input = req.body[actionName].input;
    }
    const isValid = thing.checkActionRequest(actionName, input);
    if (isValid) {
      const actionRequest = thing.requestAction(actionName, input);
      Object.assign(response, actionRequest.getActionRequest());
    } else {
      res.status(400).send(new APIError(`Action ${actionName} is invalid`).toString());
    }

    res.status(201);
    res.json(response);

  } catch (e) {
    res.status(404).send(new APIError(`Failed to request an action`, e).toString());
  }
};

/**
 * Handle a GET request to /<thingId>/actions/<action_name>/<action_id>.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const getActionRequest = async (req: IRequest, res: Response) => {
  try {
    const thingId = req.params.thingId;
    const thing = req.registry.getThing(thingId);

    const actionName = req.params.actionName;
    const actionId = req.params.actionId;

    const action = thing.getAction(actionName, actionId);
    res.json(action.getActionRequest());
  } catch (e) {
    res.status(404).send(new APIError(`Failed to get action`, e).toString());
  }
};

/**
 * Handle a DELETE request to /<thingId>/actions/<action_name>/<action_id>.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const cancelActionRequest = async (req: IRequest, res: Response) => {
  try {
    const thingId = req.params.thingId;
    const thing = req.registry.getThing(thingId);

    const actionName = req.params.actionName;
    const actionId = req.params.actionId;

    if (thing.cancelAction(actionName, actionId)) {
      res.status(204).end();
    } else {
      res.status(404).end();
    }
  } catch (e) {
    res.status(404).send(new APIError(`Failed to cancel action`, e).toString());
  }
};
