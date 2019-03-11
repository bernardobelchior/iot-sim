import { Response } from "express";
import { IRequest } from "../registryMiddleware";

/**
 * Handle a GET request to /<thingId>/actions. Returns an array with all actions available
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const getActions = async (req: IRequest, res: Response) => {
  const thingId = req.params.thingId;
  const thing = await req.registry.getThing(thingId);
  if (thing === null || thing === undefined) {
    res.status(404).end();
    return;
  }

  res.json(thing.getActionDescriptions());
};

/**
 * Handle a POST request to /<thingId>/actions.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const requestActions = async (req: IRequest, res: Response) => {
  const thingId = req.params.thingId;
  const thing = await req.registry.getThing(thingId);
  if (thing === null || thing === undefined) {
    res.status(404).end();
    return;
  }

  let response = {};
  for (const actionName in req.body) {
    let input = undefined;
    if (req.body[actionName].hasOwnProperty("input")) {
      input = req.body[actionName].input;
    }

    const action = thing.requestAction(actionName, input);
    if (action) {
      response = Object.assign(response, action.getActionRequest());
      action.startAction();
    }
  }

  res.status(201);
  res.json(response);
};

/**
 * Handle a GET request to /<thingId>/actions/<action_name>.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const getAction = async (req: IRequest, res: Response) => {
  const thingId = req.params.thingId;
  const thing = await req.registry.getThing(thingId);
  if (thing === null || thing === undefined) {
    res.status(404).end();
    return;
  }

  const actionName = req.params.actionName;

  res.json(thing.getActionDescriptions(actionName));
};

/**
 * Handle a POST request to /<thingId>/actions/<action_name>.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const requestAction = async (req: IRequest, res: Response) => {
  const thingId = req.params.thingId;
  const thing = await req.registry.getThing(thingId);
  if (thing === null || thing === undefined) {
    res.status(404).end();
    return;
  }

  const actionName = req.params.actionName;
  let response = {};
  for (const name in req.body) {
    if (name !== actionName) {
      continue;
    }

    let input = undefined;
    if (req.body[name].hasOwnProperty("input")) {
      input = req.body[name].input;
    }

    const action = thing.requestAction(name, input);
    if (action) {
      response = Object.assign(response, action.getActionRequest());
      action.startAction();
    }
  }

  res.status(201);
  res.json(response);
};

/**
 * Handle a GET request to /<thingId>/actions/<action_name>/<action_id>.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const getActionRequest = async (req: IRequest, res: Response) => {
  const thingId = req.params.thingId;
  const thing = await req.registry.getThing(thingId);
  if (thing === null || thing === undefined) {
    res.status(404).end();
    return;
  }

  const actionName = req.params.actionName;
  const actionId = req.params.actionId;

  const action = thing.getAction(actionName, actionId);
  if (action === null || action === undefined) {
    res.status(404).end();
    return;
  }

  res.json(action.getActionRequest());
};

/**
 * Handle a DELETE request to /<thingId>/actions/<action_name>/<action_id>.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
export const cancelActionRequest = async (req: IRequest, res: Response) => {
  const thingId = req.params.thingId;
  const thing = await req.registry.getThing(thingId);
  if (thing === null || thing === undefined) {
    res.status(404).end();
    return;
  }

  const actionName = req.params.actionName;
  const actionId = req.params.actionId;

  const action = thing.getAction(actionName, actionId);
  if (action === null || action === undefined) {
    res.status(404).end();
    return;
  }

  if (thing.cancelAction(actionName, actionId)) {
    res.status(204).end();
  } else {
    res.status(404).end();
  }
};
