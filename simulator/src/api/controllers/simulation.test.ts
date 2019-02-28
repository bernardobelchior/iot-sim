import * as controller from "./simulation";
import { DeviceRegistry } from "../DeviceRegistry";
import { MockMessageQueue } from "../MockMessageQueue";
import { IRequest } from "../registryMiddleware";
import express = require("express");
import { Thing } from "../models/Thing";
import { parseWebThing } from "../builder";

const thing = {
  name: "Lamp",
  description: "A web connected lamp",
  properties: {
    on: {
      title: "On/Off",
      type: "boolean",
      description: "Whether the lamp is turned on",
      links: [{ href: "/things/lamp/properties/on" }]
    }
  },
  href: "/things/lamp"
};

describe("controllers/simulation", () => {
  it("adds simulated thing when called", async () => {
    const deviceRegistry = new DeviceRegistry(new MockMessageQueue());
    const sendStatus = jest.fn();

    deviceRegistry.addThing(parseWebThing(thing));

    expect(Object.values(deviceRegistry.getSimulatedThings())).toHaveLength(0);

    controller.post(
      {
        registry: deviceRegistry,
        params: {
          id: Thing.generateIdFromHref(thing.href)
        }
      } as IRequest,
      {
        sendStatus: sendStatus as any
      } as express.Response
    );

    expect(Object.values(deviceRegistry.getSimulatedThings())).toHaveLength(1);
    expect(Object.values(deviceRegistry.getThings())).toHaveLength(1);
    expect(sendStatus).toHaveBeenCalledWith(200);
  });
});
