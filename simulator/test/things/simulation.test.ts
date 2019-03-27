import * as controller from "../../src/api/controllers/simulation";
import { DeviceRegistry } from "../../src/api/DeviceRegistry";
import { MockMessageQueue } from "../MockMessageQueue";
import { IRequest } from "../../src/api/registryMiddleware";
import express = require("express");
import { Thing } from "../../src/api/models/Thing";

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
  id: "lamp"
};

describe("controllers/simulation", () => {
  it("adds simulated thing when called", async () => {
    const deviceRegistry = new DeviceRegistry();
    deviceRegistry.setMessageQueue(new MockMessageQueue());
    const sendStatus = jest.fn();

    await deviceRegistry.addThing(Thing.fromDescription(thing));

    expect(Object.values(deviceRegistry.getSimulatedThings())).toHaveLength(0);

    await controller.post(
      {
        registry: deviceRegistry,
        params: {
          id: thing.id
        }
      } as IRequest,
      {
        sendStatus: sendStatus as any
      } as express.Response
    );

    expect(Object.values(deviceRegistry.getSimulatedThings())).toHaveLength(1);
    expect(Object.values(deviceRegistry.getThings())).toHaveLength(2);
    expect(sendStatus).toHaveBeenCalledWith(200);
  });
});
