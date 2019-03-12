import { DeviceRegistrySingleton } from "../../src/api/DeviceRegistry";
import request from "supertest";
import "jest";
import app from "../../src/app";

const thingLight1 = {
  id: "light1",
  name: "light1",
  type: "onOffSwitch",
  "@context": "https://iot.mozilla.org/schemas",
  "@type": ["OnOffSwitch"],
  properties: {
    on: {type: "boolean", value: false},
    hue: {type: "number", value: 0},
    sat: {type: "number", value: 0},
    bri: {type: "number", value: 100},
  },
  actions: {
    blink: {
      description: "Blink the switch on and off",
    },
  },
  events: {
    surge: {
      description: "Surge in power detected",
    },
  },
};

const thingLight2 = {
  id: "light2",
  name: "light2",
  type: "onOffSwitch",
  "@context": "https://iot.mozilla.org/schemas",
  "@type": ["OnOffSwitch"],
  properties: {
    on: {type: "boolean", value: false},
    hue: {type: "number", value: 0},
    sat: {type: "number", value: 0},
    bri: {type: "number", value: 100},
  },
};

const thingLight3 = {
  id: "light3",
  name: "light3",
  type: "onOffSwitch",
  "@context": "https://iot.mozilla.org/schemas",
  "@type": ["OnOffSwitch"],
  properties: {
    on: {type: "boolean", value: false},
    hue: {type: "number", value: 0},
    sat: {type: "number", value: 0},
    bri: {type: "number", value: 100},
    color: {type: "string", value: "#ff7700"},
  },
};

describe("rules engine", () => {
  // const ruleId = undefined;
  let appInstance: any = undefined;

  async function addDevice(desc: any) {
    const { id } = desc;
    await DeviceRegistrySingleton.createThing(id, desc);
  }

/*   async function deleteRule(id: string) {
    const res = await request(appInstance)
      .delete(`/rules/${id}`)
      .set("Accept", "application/json")
      .send();
    expect(res.status).toEqual(200);
  } */

  beforeEach(async () => {
    appInstance = await app();
    await addDevice(thingLight1);
    await addDevice(thingLight2);
    await addDevice(thingLight3);
  });

  it("gets a list of 0 rules", async () => {
    const res = await request(appInstance)
      .delete(`/rules`)
      .set("Accept", "application/json")
      .send();
    expect(res.status).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toEqual(0);
  });
});