import { BooleanTrigger, LevelTrigger, EqualityTrigger, MultiTrigger } from "../../src/rules-engine/triggers";
import { Property } from "../../src/rules-engine/Property";
import request from "supertest";
import "jest";
import app from "../../src/app";


const booleanTrigger = {
  property: {
    type: "boolean",
    thing: "light1",
    id: "on",
  },
  type: "BooleanTrigger",
  onValue: true,
};

const levelTrigger = {
  property: {
    type: "number",
    thing: "light2",
    id: "hue",
  },
  type: "LevelTrigger",
  levelType: "LESS",
  value: 120,
};

const equalityTrigger = {
  property: {
    type: "string",
    thing: "light2",
    id: "color",
  },
  type: "EqualityTrigger",
  value: "#ff7700",
};

const andTrigger = {
  triggers: [
    booleanTrigger,
    levelTrigger,
  ],
  type: "MultiTrigger",
  op: "AND",
};

const thingLight1 = {
  id: "light1",
  name: "light1",
  type: "onOffSwitch",
  "@context": "https://iot.mozilla.org/schemas",
  "@type": ["OnOffSwitch"],
  properties: {
    on: { type: "boolean", value: false },
    hue: { type: "number", value: 0 },
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

const thingLight2 = {
  id: "light2",
  name: "light2",
  type: "onOffSwitch",
  "@context": "https://iot.mozilla.org/schemas",
  "@type": ["OnOffSwitch"],
  properties: {
    on: { type: "boolean", value: false },
    hue: { type: "number", value: 0 },
    sat: { type: "number", value: 0 },
    bri: { type: "number", value: 100 },
    color: { type: "number", value: 100 }
  }
};

describe("triggers", () => {
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
    await addDevice(thingLight2);
  });


  it("should parse a BooleanTrigger", () => {
    const p = new Property("boolean", "on", "light1");
    const trigger = new BooleanTrigger(booleanTrigger.type, p, booleanTrigger.onValue);
    expect(trigger).toMatchObject(booleanTrigger);
  });

  it("should parse a LevelTrigger", () => {
    const p = new Property("number", "hue", "light2");
    const trigger = new LevelTrigger(levelTrigger.type, p, levelTrigger.value, levelTrigger.levelType);
    expect(trigger).toMatchObject(levelTrigger);
  });

  it("should parse an EqualityTrigger", () => {
    const p = new Property("string", "color", "light2");
    const trigger = new EqualityTrigger(equalityTrigger.type, p, equalityTrigger.value);
    expect(trigger).toMatchObject(equalityTrigger);
  });

  it("should parse a MultiTrigger", () => {
    const p1 = new Property("boolean", "on", "light1");
    const p2 = new Property("number", "hue", "light2");
    const triggers = [new BooleanTrigger(booleanTrigger.type, p1, booleanTrigger.onValue), new LevelTrigger(levelTrigger.type, p2, levelTrigger.value, levelTrigger.levelType)];
    const trigger = new MultiTrigger(andTrigger.type, andTrigger.op, triggers);
    expect(trigger).toMatchObject(andTrigger);
  });

  it("should reject an unknown levelType", () => {
    let err = undefined;
    try {
      const p = new Property("number", "hue", "light2");
      new LevelTrigger(levelTrigger.type, p, levelTrigger.value, "INVALID_LEVEL");
    } catch (e) {
      err = e;
    }
    expect(err).toBeTruthy();
  });
});