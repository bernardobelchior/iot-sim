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
    bri: { type: "number", value: 100 }
  }
};

const thingLight3 = {
  id: "light3",
  name: "light3",
  type: "onOffSwitch",
  "@context": "https://iot.mozilla.org/schemas",
  "@type": ["OnOffSwitch"],
  properties: {
    on: { type: "boolean", value: false },
    hue: { type: "number", value: 0 },
    sat: { type: "number", value: 0 },
    bri: { type: "number", value: 100 },
    color: { type: "string", value: "#ff7700" }
  }
};

const testRule = {
  enabled: true,
  trigger: {
    property: {
      type: "boolean",
      id: "on",
      thing: "light1"
    },
    type: "BooleanTrigger",
    onValue: true,
    label: "Does something"
  },
  effect: {
    property: {
      type: "boolean",
      thing: "light2",
      id: "on"
    },
    type: "PulseEffect",
    value: true,
    label: "effect"
  }
};

const numberTestRule = {
  enabled: true,
  name: "Number Test Rule",
  trigger: {
    property: {
      type: "number",
      thing: "light2",
      id: "hue"
    },
    type: "LevelTrigger",
    levelType: "GREATER",
    value: 120,
    label: "one trigger"
  },
  effect: {
    property: {
      type: "number",
      thing: "light3",
      id: "bri"
    },
    type: "PulseEffect",
    value: 30,
    label: "pulse"
  }
};

describe("rules engine", () => {
  let ruleId: string;
  let appInstance: any = undefined;

  async function addDevice(desc: any) {
    const res = await request(appInstance)
      .post(`/things`)
      .set("Accept", "application/json")
      .send(desc);
    expect(res.status).toEqual(200);
  }

  async function deleteRule(id: string) {
    const res = await request(appInstance)
      .delete(`/rules/${id}`)
      .set("Accept", "application/json")
      .send();
    expect(res.status).toEqual(200);
  }

  beforeAll(async () => {
    appInstance = await app();
    await addDevice(thingLight1);
    await addDevice(thingLight2);
    await addDevice(thingLight3);
  });

  it("gets a list of 0 rules", async () => {
    const res = await request(appInstance)
      .get(`/rules`)
      .set("Accept", "application/json")
      .send();
    expect(res.status).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toEqual(0);
  });

  it("fails to create a rule", async () => {
    const err = await request(appInstance)
      .post(`/rules`)
      .set("Accept", "application/json")
      .send({
        trigger: {
          property: undefined,
          type: "Whatever"
        },
        effect: testRule.effect
      });
    expect(err.status).toEqual(400);
  });

  it("creates a rule", async () => {
    let res = await request(appInstance)
      .post(`/rules`)
      .set("Accept", "application/json")
      .send(testRule);

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("id");
    ruleId = res.body.id;

    res = await request(appInstance)
      .get(`/rules`)
      .set("Accept", "application/json")
      .send();
    expect(res.status).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toEqual(1);
    expect(res.body[0]).toMatchObject(testRule);
  });

  it("gets this rule specifically", async () => {
    const res = await request(appInstance)
      .get(`/rules/${ruleId}`)
      .set("Accept", "application/json")
      .send();
    expect(res.status).toEqual(200);
    expect(res.body).toMatchObject(testRule);
  });

  it("fails to get a nonexistent rule specifically", async () => {
    const err = await request(appInstance)
      .get(`/rules/invalid-rule`)
      .set("Accept", "application/json")
      .send();
    expect(err.status).toEqual(404);
  });

  it("modifies this rule", async () => {
    let res = await request(appInstance)
      .put(`/rules/${ruleId}`)
      .set("Accept", "application/json")
      .send(numberTestRule);
    expect(res.status).toEqual(200);

    res = await request(appInstance)
      .get(`/rules`)
      .set("Accept", "application/json")
      .send();
    expect(res.status).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toEqual(1);
    expect(res.body[0]).toMatchObject(numberTestRule);
  });

  it("deletes this rule", async () => {
    await deleteRule(ruleId);

    const res = await request(appInstance)
      .get(`/rules`)
      .set("Accept", "application/json")
      .send();
    expect(res.status).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toEqual(0);
  });

  it("fails to modify a nonexistent rule", async () => {
    const err = await request(appInstance)
      .put(`/rules/invalid-rule`)
      .set("Accept", "application/json")
      .send(testRule);
    expect(err.status).toEqual(404);
  });
});
