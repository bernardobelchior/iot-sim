import { EventEmitter } from "events";
import { TriggerEmitter } from "./Events";
import { DeviceRegistry } from "../api/DeviceRegistry";
import { Property as ThingProperty } from "../api/models/Property";

/**
 * Utility to support operations on Thing's properties
 */
export class Property extends (EventEmitter as { new (): TriggerEmitter }) {
  id: string;
  type: string;
  thing: string;
  unit?: string;
  description?: string;

  /**
   * Create a Property from a descriptor returned by the WoT API
   */
  constructor(
    type: string,
    id: string,
    thing: string,
    unit?: string,
    description?: string
  ) {
    super();

    this.type = type;
    this.thing = thing;
    this.id = id;

    if (unit) {
      this.unit = unit;
    }
    if (description) {
      this.description = description;
    }

    this.onPropertyChanged = this.onPropertyChanged.bind(this);
    this.onThingAdded = this.onThingAdded.bind(this);
  }

  /**
   * @return {any}
   */
  toDescription(): any {
    const desc: any = {
      type: this.type,
      thing: this.thing,
      id: this.id
    };
    if (this.unit) {
      desc.unit = this.unit;
    }
    if (this.description) {
      desc.description = this.description;
    }
    return desc;
  }

  /**
   * @return {Promise} resolves to property's value or undefined if not found
   */
  async get(): Promise<any> {
    try {
      return await DeviceRegistry.getThingProperty(this.thing, this.id);
    } catch (e) {
      console.warn("Rule get failed", e);
    }
  }

  /**
   * @param {any} value
   * @return {Promise} resolves when set is done
   */
  async set(value: any) {
    try {
      return await DeviceRegistry.setThingProperty(this.thing, this.id, value);
    } catch (e) {
      console.warn("Rule set failed", e);
    }
  }

  async start() {
    // AddonManager.on(Constants.PROPERTY_CHANGED, this.onPropertyChanged);

    try {
      await this.getInitialValue();
    } catch (_e) {
      // AddonManager.on(Constants.THING_ADDED, this.onThingAdded);
    }
  }

  async getInitialValue() {
    const initialValue = await this.get();
    if (typeof initialValue === "undefined") {
      throw new Error("Did not get a real value");
    }
    this.emit("valueChanged", initialValue);
  }

  /**
   * @param {String} thing - thing id
   */
  onThingAdded(thing: string) {
    if (thing !== this.thing) {
      return;
    }
    this.getInitialValue().catch(e => {
      console.warn("Rule property unable to get value", e);
    });
  }

  onPropertyChanged(propertyDevice: string, property: ThingProperty) {
    if (propertyDevice !== this.thing) {
      return;
    }
    if (property.title !== this.id) {
      return;
    }
    this.emit("valueChanged", property.value);
  }

  stop() {
    /*  AddonManager.removeListener(
      Constants.PROPERTY_CHANGED,
      this.onPropertyChanged
    );
    AddonManager.removeListener(Constants.THING_ADDED, this.onThingAdded); */
  }
}