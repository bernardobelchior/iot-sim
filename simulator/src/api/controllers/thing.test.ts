import request from "supertest";
import app from "../../app";
import { Thing } from "../models/Thing";

const TEST_THING = {
  id: "test-1",
  name: "test-1",
  "@context": "https://iot.mozilla.org/schemas",
  "@type": ["OnOffSwitch"],
  properties: {
    power: {
      "@type": "OnOffProperty",
      type: "boolean",
      value: false
    },
    percent: {
      "@type": "LevelProperty",
      type: "number",
      value: 20
    }
  }
};

const VALIDATION_THING = {
  id: "validation-1",
  name: "validation-1",
  "@context": "https://iot.mozilla.org/schemas",
  properties: {
    readOnlyProp: {
      type: "boolean",
      readOnly: true,
      value: true
    },
    minMaxProp: {
      type: "number",
      minimum: 10,
      maximum: 20,
      value: 15
    },
    enumProp: {
      type: "string",
      enum: ["val1", "val2", "val3"],
      value: "val2"
    },
    multipleProp: {
      type: "integer",
      minimum: 0,
      maximum: 600,
      value: 10,
      multipleOf: 5
    }
  }
};

const piDescr = {
  id: "pi-1",
  name: "pi-1",
  "@context": "https://iot.mozilla.org/schemas",
  "@type": ["OnOffSwitch"],
  properties: {
    power: {
      "@type": "OnOffProperty",
      type: "boolean",
      value: true,
      links: [
        {
          rel: "alternate",
          href: "/properties/power"
        }
      ]
    }
  },
  actions: {
    reboot: {
      description: "Reboot the device",
      links: [
        {
          rel: "alternate",
          href: "/actions/reboot"
        }
      ]
    }
  },
  events: {
    reboot: {
      description: "Going down for reboot",
      links: [
        {
          rel: "alternate",
          href: "/events/reboot"
        }
      ]
    }
  }
};

describe("Thing.isSimulated()", () => {
  it("should return true if thingId has 'Simulated' in '@type'", function() {
    const thing = new Thing("Lamp", "Test", "/1", undefined, ["Simulated"]);

    expect(thing.isSimulated()).toBeTruthy();
  });
});

describe("things/", function() {
  let appInstance: any = undefined;

  async function addDevice(desc: any = TEST_THING) {
    const res = await request(appInstance)
      .post(`/things`)
      .set("Accept", "application/json")
      .send(desc);
    expect(res.status).toEqual(200);
  }

  beforeAll(async () => {
    appInstance = await app();
  });

  it("GET with no things", async () => {
    const res = await request(appInstance)
      .get(`/things`)
      .set("Accept", "application/json")
      .send();

    expect(res.status).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toEqual(0);
  });

  it("fail to create a new thingId (empty body)", async () => {
    const err = await request(appInstance)
      .post(`/things`)
      .set("Accept", "application/json")
      .send();
    expect(err.status).toEqual(400);
  });

  it("fail to create a new thingId (duplicate)", async () => {
    await addDevice();
    const res = await request(appInstance)
      .post(`/things`)
      .set("Accept", "application/json")
      .send(TEST_THING);
    expect(res.status).toEqual(404);
  });

  it("GET with 1 thingId", async () => {
    const res = await request(appInstance)
      .get(`/things`)
      .set("Accept", "application/json")
      .send();

    expect(res.status).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toEqual(1);
    expect(res.body[0]).toHaveProperty("href");
    expect(res.body[0].href).toEqual(`/things/test-1`);
  });

  it("GET a thingId", async () => {
    const thingDescr = JSON.parse(JSON.stringify(piDescr));

    await addDevice(thingDescr);
    const res = await request(appInstance)
      .get(`/things/${thingDescr.id}`)
      .set("Accept", "application/json")
      .send();

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("name");
    expect(res.body.name).toEqual(thingDescr.name);

    // Fix up links
    thingDescr.properties.power.links[0].href = `/things/${thingDescr.id}${
      thingDescr.properties.power.links[0].href
    }`;
    thingDescr.properties.power.links.push({
      rel: "property",
      href: `/things/${thingDescr.id}/properties/power`
    });

    thingDescr.actions.reboot.links[0].href = `/things/${thingDescr.id}${
      thingDescr.actions.reboot.links[0].href
    }`;
    thingDescr.actions.reboot.links.push({
      rel: "action",
      href: `/things/${thingDescr.id}/actions/reboot`
    });

    thingDescr.events.reboot.links[0].href = `/things/${thingDescr.id}${
      thingDescr.events.reboot.links[0].href
    }`;
    thingDescr.events.reboot.links.push({
      rel: "event",
      href: `/things/${thingDescr.id}/events/reboot`
    });

    delete thingDescr.id;
    delete thingDescr.properties.power.value;

    expect(res.body).toMatchObject(thingDescr);
  });

  it("fail to GET a nonexistent thingId", async () => {
    const err = await request(appInstance)
      .get(`/things/test-2`)
      .set("Accept", "application/json")
      .send();

    expect(err.status).toEqual(404);
  });

  it("GET all properties of a thingId", async () => {
    const res = await request(appInstance)
      .get(`/things/test-1/properties`)
      .set("Accept", "application/json")
      .send();

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("power");
    expect(res.body.power).toEqual(false);
    expect(res.body).toHaveProperty("percent");
    expect(res.body.percent).toEqual(20);
  });

  it("GET a property of a thingId", async () => {
    const res = await request(appInstance)
      .get(`/things/test-1/properties/power`)
      .set("Accept", "application/json")
      .send();

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("power");
    expect(res.body.power).toEqual(false);
  });

  it("fail to GET a nonexistent property of a thingId", async () => {
    const err = await request(appInstance)
      .get(`/things/test-1/properties/invalid-property`)
      .set("Accept", "application/json")
      .send();

    expect(err.status).toEqual(404);
  });

  it("fail to GET a property of a nonexistent thingId", async () => {
    const err = await request(appInstance)
      .get(`/things/invalid-thing/properties/power`)
      .set("Accept", "application/json")
      .send();

    expect(err.status).toEqual(404);
  });

  it("fail to set a property of a thingId", async () => {
    const err = await request(appInstance)
      .put(`/things/test-1/properties/power`)
      .set("Accept", "application/json")
      .send({});
    expect(err.status).toEqual(400);
  });

  it("fail to set a property of a thingId", async () => {
    const err = await request(appInstance)
      .put(`/things/test-1/properties/power`)
      .set("Accept", "application/json")
      .send({ invalidAttr: true });
    expect(err.status).toEqual(400);
  });

  it("set a property of a thingId", async () => {
    const on = await request(appInstance)
      .put(`/things/test-1/properties/power`)
      .set("Accept", "application/json")
      .send({ power: true });

    expect(on.status).toEqual(200);
    expect(on.body).toHaveProperty("power");
    expect(on.body.power).toEqual(true);

    // Flip it back to off...
    const off = await request(appInstance)
      .put(`/things/test-1/properties/power`)
      .set("Accept", "application/json")
      .send({ power: false });

    expect(off.status).toEqual(200);
    expect(off.body).toHaveProperty("power");
    expect(off.body.power).toEqual(false);
  });

  it("fail to set read-only property", async () => {
    await addDevice(VALIDATION_THING);

    let res = await request(appInstance)
      .get(`/things/validation-1/properties/readOnlyProp`)
      .set("Accept", "application/json")
      .send();

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("readOnlyProp");
    expect(res.body.readOnlyProp).toEqual(true);

    const err = await request(appInstance)
      .put(`/things/validation-1/properties/readOnlyProp`)
      .set("Accept", "application/json")
      .send({ readOnlyProp: false });
    expect(err.status).toEqual(400);

    res = await request(appInstance)
      .get(`/things/validation-1/properties/readOnlyProp`)
      .set("Accept", "application/json")
      .send();

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("readOnlyProp");
    expect(res.body.readOnlyProp).toEqual(true);
  });

  it("fail to set invalid number property value", async () => {
    let res = await request(appInstance)
      .get(`/things/validation-1/properties/minMaxProp`)
      .set("Accept", "application/json")
      .send();

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("minMaxProp");
    expect(res.body.minMaxProp).toEqual(15);

    let err = await request(appInstance)
      .put(`/things/validation-1/properties/minMaxProp`)
      .set("Accept", "application/json")
      .send({ minMaxProp: 0 });
    expect(err.status).toEqual(400);

    res = await request(appInstance)
      .get(`/things/validation-1/properties/minMaxProp`)
      .set("Accept", "application/json")
      .send();

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("minMaxProp");
    expect(res.body.minMaxProp).toEqual(15);

    err = await request(appInstance)
      .put(`/things/validation-1/properties/minMaxProp`)
      .set("Accept", "application/json")
      .send({ minMaxProp: 30 });
    expect(err.status).toEqual(400);

    res = await request(appInstance)
      .get(`/things/validation-1/properties/minMaxProp`)
      .set("Accept", "application/json")
      .send();

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("minMaxProp");
    expect(res.body.minMaxProp).toEqual(15);

    res = await request(appInstance)
      .get(`/things/validation-1/properties/multipleProp`)
      .set("Accept", "application/json")
      .send();

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("multipleProp");
    expect(res.body.multipleProp).toEqual(10);

    err = await request(appInstance)
      .put(`/things/validation-1/properties/multipleProp`)
      .set("Accept", "application/json")
      .send({ multipleProp: 3 });
    expect(err.status).toEqual(400);

    res = await request(appInstance)
      .get(`/things/validation-1/properties/multipleProp`)
      .set("Accept", "application/json")
      .send();

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("multipleProp");
    expect(res.body.multipleProp).toEqual(10);

    res = await request(appInstance)
      .put(`/things/validation-1/properties/multipleProp`)
      .set("Accept", "application/json")
      .send({ multipleProp: 30 });
    expect(res.status).toEqual(200);

    res = await request(appInstance)
      .get(`/things/validation-1/properties/multipleProp`)
      .set("Accept", "application/json")
      .send();

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("multipleProp");
    expect(res.body.multipleProp).toEqual(30);
  });

  it("fail to set invalid enum property value", async () => {
    let res = await request(appInstance)
      .get(`/things/validation-1/properties/enumProp`)
      .set("Accept", "application/json")
      .send();

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("enumProp");
    expect(res.body.enumProp).toEqual("val2");

    const err = await request(appInstance)
      .put(`/things/validation-1/properties/enumProp`)
      .set("Accept", "application/json")
      .send({ enumProp: "val0" });
    expect(err.status).toEqual(400);

    res = await request(appInstance)
      .get(`/things/validation-1/properties/enumProp`)
      .set("Accept", "application/json")
      .send();

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("enumProp");
    expect(res.body.enumProp).toEqual("val2");
  });
});
