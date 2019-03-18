import request from "supertest";
import "jest";
import app from "../../src/app";

const thingLight = {
  id: "light",
  name: "light",
  type: "onOffLight",
  "@context": "https://iot.mozilla.org/schemas",
  "@type": ["OnOffSwitch", "Light"],
  properties: {
    power: {
      "@type": "OnOffProperty",
      type: "boolean",
      value: false,
    },
  },
  actions: {
    blink: {
      links: [],
      description: "Blink the switch on and off",
    }
  },
};

describe("actions/", () => {
  let appInstance: any = undefined;

  async function addDevice(desc: any = thingLight) {
    const res = await request(appInstance)
      .post(`/things`)
      .set("Accept", "application/json")
      .send(desc);
    expect(res.status).toEqual(200);
  }

  beforeEach(async () => {
    appInstance = await app();
    addDevice();
  });
});