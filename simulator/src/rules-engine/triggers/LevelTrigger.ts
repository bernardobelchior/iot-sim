import assert from "assert";
import PropertyTrigger from "./PropertyTrigger";
import { Property } from "../Property";

enum LevelTriggerTypes {
  LESS =  "LESS",
  EQUAL = "EQUAL",
  GREATER = "GREATER",
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
  constructor(label: string, property: Property, value: number, levelType: LevelTriggerTypes) {
    super(label, property);
    assert(this.property.type === "number" || this.property.type === "integer");
    assert(LevelTriggerTypes[levelType]);
    if (levelType === LevelTriggerTypes.EQUAL) {
      assert(this.property.type === "integer");
    }

    this.value = value;
    this.levelType = levelType;
  }

  /**
   * @return {any}
   */
  toDescription(): any {
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

    this.emit("stateChanged", {on: on, value: propValue});
  }
}