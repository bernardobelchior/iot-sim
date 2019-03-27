import assert from "assert";
import PropertyTrigger from "./PropertyTrigger";
import { Property } from "../Property";

enum LevelTriggerTypes {
  LESS = "LESS",
  EQUAL = "EQUAL",
  GREATER = "GREATER"
}

/**
 * A trigger which activates when a numerical property is less or greater than
 * a given level
 */
export default class LevelTrigger extends PropertyTrigger {
  value: number;
  levelType: LevelTriggerTypes;

  /**
   *
   * @param label
   * @param property
   * @param value
   * @param levelType
   */
  constructor(
    label: string,
    property: Property,
    value: number,
    levelType: string
  ) {
    super(label, property);
    assert(this.property.type === "number" || this.property.type === "integer");
    if (!Object.values(LevelTriggerTypes).includes(levelType)) {
      throw Error("Level type missing");
    }
    const levelIdx = levelType as keyof typeof LevelTriggerTypes;
    if (levelIdx === LevelTriggerTypes.EQUAL) {
      assert(this.property.type === "integer");
    }

    this.value = value;
    this.levelType = LevelTriggerTypes[levelIdx];
  }

  /**
   * Creates a trigger from a given object
   * @param {any} desc
   */
  static fromDescription(desc: any) {
    if (!desc.hasOwnProperty("levelType")) {
      throw new Error("Level Type property missing from object.");
    }
    if (!desc.hasOwnProperty("value")) {
      throw new Error("Value property missing from object.");
    }
    if (!desc.hasOwnProperty("property")) {
      throw new Error("Property description missing from object.");
    }
    return new this(desc.label, Property.fromDescription(desc.property), desc.value, desc.levelType);
  }

  /**
   * Creates a JSON object from a multi trigger instance
   * @return {Object}
   */
  toDescription(): Object {
    return Object.assign(
      super.toDescription(),
      {
        value: this.value,
        levelType: this.levelType,
      }
    );
  }

  /**
   * @param {number} propValue
   */
  onValueChanged(propValue: number) {
    let on = false;

    switch (this.levelType) {
      case LevelTriggerTypes.LESS:
        if (propValue < this.value) {
          on = true;
        }
        break;
      case LevelTriggerTypes.EQUAL:
        if (propValue === this.value) {
          on = true;
        }
        break;
      case LevelTriggerTypes.GREATER:
        if (propValue > this.value) {
          on = true;
        }
        break;
    }

    this.emit("stateChanged", { on: on, value: propValue });
  }
}
