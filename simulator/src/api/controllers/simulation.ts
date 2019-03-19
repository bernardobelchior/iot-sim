import { Response } from "express";
import { IRequest } from "../registryMiddleware";
import { Thing } from "../models/Thing";
import { SimulatedThing } from "../models/SimulatedThing";

export const post = async (req: IRequest, res: Response) => {
  const thing: Thing | undefined = req.registry.getThing(req.params.id);

  if (thing) {
    await req.registry.addThing(new SimulatedThing(thing));
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
};
