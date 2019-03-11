import { BooleanTrigger, LevelTrigger, EqualityTrigger, MultiTrigger } from "../../src/rules-engine/triggers";
import { Property } from "../../src/rules-engine/Property";

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


describe("triggers", () => {
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