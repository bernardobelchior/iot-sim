import { EventEmitter } from "events";
import { TriggerEmitter } from "./Events";
import { Simulator } from "../Simulator";
import { DeviceRegistry } from "../api/DeviceRegistry";

/**
 * Utility to support operations on Thing's properties
 */
export class Property extends (EventEmitter as { new (): TriggerEmitter }) {
  id: string;
  type: string;
  thingId: string;
  unit?: string;
  description?: string;

  /**
   * Create a Property from a descriptor returned by the WoT API
   */
  constructor(
    type: string,
    id: string,
    thingId: string,
    unit?: string,
    description?: string
  ) {
    super();

    Simulator.getInstance().then(i => {
      const t = i.getRegistry().getThing(thingId);

      if (t === undefined) {
        throw new Error(`Thing with ID '${id}' doesn't exist.`);
      }

      if (!t.hasProperty(id)) {
        throw new Error(`Property ${id} doesn't exist on thing ${thingId}.`);
      }
    });

    this.type = type;
    this.thingId = thingId;
    this.id = id;

    if (unit) {
      this.unit = unit;
    }

    if (description) {
      this.description = description;
    }

    this.onPropertyChanged = this.onPropertyChanged.bind(this);
    this.getInitialValue();
  }

  /**
   * Creates a property from an object
   * @param desc
   */
  static fromDescription(desc: any): Property {
    if (!desc.hasOwnProperty("type")) {
      throw new Error("Type property missing from object.");
    }
    if (!desc.hasOwnProperty("id")) {
      throw new Error("Id property missing from object.");
    }
    if (!desc.hasOwnProperty("thingId")) {
      throw new Error("Thing property missing from object.");
    }
    return new this(
      desc.type,
      desc.id,
      desc.thingId,
      desc.unit,
      desc.description
    );
  }

  /**
   * Creates an JSON object from the property instance
   * @return {any}
   */
  toDescription(): any {
    const desc: any = {
      type: this.type,
      thing: this.thingId,
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
   * @return {any} resolves to property's value or undefined if not found
   */
  async get(): Promise<any> {
    try {
      const registry: DeviceRegistry = (await Simulator.getInstance()).getRegistry();
      return registry.getThingProperty(this.thingId, this.id);
    } catch (e) {
      console.warn("Property get failed", e);
    }
  }

  /**
   * @param {any} value
   * @return {any} resolves when set is done
   */
  set(value: any): any {
    try {
      const registry = (await Simulator.getInstance()).getRegistry();
      return registry.setThingProperty(this.thingId, this.id, value);
    } catch (e) {
      console.warn("Property set failed", e);
    }
  }

  getInitialValue() {
    const initialValue = this.get();
    if (typeof initialValue === "undefined") {
      throw new Error("Did not get a real value");
    }
    this.emit("valueChanged", initialValue);
  }

  onPropertyChanged(
    propertyDevice: string,
    propertyId: string,
    propertyValue: any
  ) {
    if (propertyDevice !== this.thingId) {
      return;
    }
    if (propertyId !== this.id) {
      return;
    }
    this.emit("valueChanged", propertyValue);
  }
}
