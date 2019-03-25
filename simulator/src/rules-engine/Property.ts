import { EventEmitter } from "events";
import { TriggerEmitter } from "./Events";
import { SimulatorSingleton } from "../Simulator";

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

    const registry = SimulatorSingleton.getRegistry();
    const t = registry.getThing(thing);
    if (!t.hasProperty(id)) {
      throw new Error(`Property ${id} doesn't exist on thing ${thing}.`);
    }

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
    if (!desc.hasOwnProperty("thing")) {
      throw new Error("Thing property missing from object.");
    }
    return new this(
      desc.type,
      desc.id,
      desc.thing,
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
   * @return {any} resolves to property's value or undefined if not found
   */
  get(): any {
    try {
      const registry = SimulatorSingleton.getRegistry();
      return registry.getThingProperty(this.thing, this.id);
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
      const registry = SimulatorSingleton.getRegistry();
      return registry.setThingProperty(this.thing, this.id, value);
    } catch (e) {
      console.warn("Property set failed", e);
    }
  }

  async start() {
    // TODO
  }

  stop() {
    // TODO
  }

  getInitialValue() {
    const initialValue = this.get();
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
    this.getInitialValue();
  }

  onPropertyChanged(
    propertyDevice: string,
    propertyId: string,
    propertyValue: any
  ) {
    if (propertyDevice !== this.thing) {
      return;
    }
    if (propertyId !== this.id) {
      return;
    }
    this.emit("valueChanged", propertyValue);
  }
}
