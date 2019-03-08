import { PulseEffect, SetEffect, MultiEffect } from "../../src/rules-engine/effects";
import { Property } from "../../src/rules-engine/Property";

const pulseEffect = {
  property: {
    type: "boolean",
    thing: "light1",
    id: "on",
  },
  type: "PulseEffect",
  value: true,
};

const setEffect = {
  property: {
    type: "number",
    thing: "thermostat",
    id: "temp",
    unit: "celsius",
    description: "thermostat setpoint",
  },
  type: "SetEffect",
  value: 30,
};

const bothEffect = {
  effects: [
    pulseEffect,
    setEffect,
  ],
  type: "MultiEffect",
};

describe("effects", () => {
  let p: Property;
  it("should create a PulseEffect, SetEffect and MultiEffect", () => {
    p = new Property(pulseEffect.property.type, pulseEffect.property.id, pulseEffect.property.thing);
    const pEffect = new PulseEffect(pulseEffect.type, p, pulseEffect.value);
    expect(pEffect).toMatchObject(pulseEffect);

    p = new Property(setEffect.property.type, setEffect.property.id, setEffect.property.thing, setEffect.property.unit, setEffect.property.description);
    const sEffect = new SetEffect(setEffect.type, p, setEffect.value);
    expect(sEffect).toMatchObject(setEffect);

    const mEffect = new MultiEffect(bothEffect.type, [pEffect, sEffect]);
    expect(mEffect).toMatchObject(bothEffect);
  });

  it("should reject a value type disagreeing with property type", () => {
    let err = undefined;
    p = new Property(pulseEffect.property.type, pulseEffect.property.id, pulseEffect.property.thing);
    try {
      new PulseEffect(pulseEffect.type, p, 12);
    } catch (error) {
      err = error;
    }
    expect(err).toBeTruthy();
  });
});