import {
  PulseEffect,
  SetEffect,
  MultiEffect
} from "../../src/rules-engine/effects";
import { Property } from "../../src/rules-engine/Property";
import request from "supertest";
import "jest";
import app from "../../src/app";
import { Simulator } from "../../src/Simulator";

const pulseEffect = {
  property: {
    type: "boolean",
    thingId: "light1",
    id: "on"
  },
  type: "PulseEffect",
  value: true
};

const setEffect = {
  property: {
    type: "number",
    thingId: "thermostat",
    id: "temp",
    unit: "celsius",
    description: "thermostat setpoint"
  },
  type: "SetEffect",
  value: 30
};

const bothEffect = {
  effects: [pulseEffect, setEffect],
  type: "MultiEffect"
};

const thingLight1 = {
  id: "light1",
  name: "light1",
  type: "onOffSwitch",
  "@context": "https://iot.mozilla.org/schemas",
  "@type": ["OnOffSwitch"],
  properties: {
    on: { type: "boolean", value: false },
    temp: { type: "number", value: 0 },
    sat: { type: "number", value: 0 },
    bri: { type: "number", value: 100 }
  },
  actions: {
    blink: {
      description: "Blink the switch on and off"
    }
  },
  events: {
    surge: {
      description: "Surge in power detected"
    }
  }
};

const thermostat = {
  id: "thermostat",
  name: "thermostat",
  type: "thermostat",
  "@context": "https://iot.mozilla.org/schemas",
  "@type": ["thermostat"],
  properties: {
    temp: { type: "number", value: 0 }
  },
  actions: {},
  events: {}
};

describe("effects", () => {
  let appInstance: any = undefined;

  async function addDevice(desc: any) {
    const res = await request(appInstance)
      .post(`/things`)
      .set("Accept", "application/json")
      .send(desc);
    expect(res.status).toEqual(200);
  }

  beforeAll(async () => {
    appInstance = await app();
    await addDevice(thingLight1);
    await addDevice(thermostat);
  });

  afterAll(async () => {
    await (await Simulator.getInstance()).finalize();
  });

  let p: Property;
  it("should create a PulseEffect, SetEffect and MultiEffect", () => {
    p = new Property(
      pulseEffect.property.type,
      pulseEffect.property.id,
      pulseEffect.property.thingId
    );
    const pEffect = new PulseEffect(pulseEffect.type, p, pulseEffect.value);
    expect(pEffect.toDescription()).toMatchObject(pulseEffect);

    p = new Property(
      setEffect.property.type,
      setEffect.property.id,
      setEffect.property.thingId,
      setEffect.property.unit,
      setEffect.property.description
    );
    const sEffect = new SetEffect(setEffect.type, p, setEffect.value);
    expect(sEffect.toDescription()).toMatchObject(setEffect);

    const mEffect = new MultiEffect(bothEffect.type, [pEffect, sEffect]);
    expect(mEffect.toDescription()).toMatchObject(bothEffect);
  });

  it("should reject a value type disagreeing with property type", () => {
    let err = undefined;
    p = new Property(
      pulseEffect.property.type,
      pulseEffect.property.id,
      pulseEffect.property.thingId
    );
    try {
      new PulseEffect(pulseEffect.type, p, 12);
    } catch (error) {
      err = error;
    }
    expect(err).toBeTruthy();
  });
});
