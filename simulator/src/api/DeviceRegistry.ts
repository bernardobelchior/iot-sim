import fs from "fs";
import { Thing } from "./models/Thing";
import ThingSchema from "../db/Thing";
import { MessageQueue } from "./MessageQueue";

type ThingMap = { [id: string]: Thing };

export class DeviceRegistry {
  private simulatedThings: ThingMap = {};
  private things: ThingMap = {};
  private messageQueue?: MessageQueue;

  private getThingsPromise: any = undefined;

  constructor(messageQueue?: MessageQueue) {
    this.messageQueue = messageQueue;
  }

  initFromConfig() {
    const filePath = `${process.cwd()}/src/environment/sensors.json`;
    const data = JSON.parse(fs.readFileSync(filePath).toString());
    data.things.forEach((t: any) => {
      const thing = Thing.fromDescription(t);
      this.things[thing.id] = thing;
    });

    return this.init();
  }

  /**
   * Subscribes to the message queue. If this is not called, then messages
   * published to the message queue will not be consumed.
   */
  init() {
    if (this.messageQueue)
      return this.messageQueue.subscribe("register", this.consume.bind(this));
    return;
  }

  /**
   * Gets map of virtual things
   * @return {ThingMap}
   */
  getSimulatedThings(): ThingMap {
    return this.simulatedThings;
  }

  /**
   * Gets map of physical things
   * @return {ThingMap}
   */
  getPhysicalThings(): ThingMap {
    return this.things;
  }

  async getThings(): Promise<ThingMap> {
    if (
      Object.keys(this.things).length > 0 ||
      Object.keys(this.simulatedThings).length > 0
    ) {
      return Promise.resolve({ ...this.things, ...this.simulatedThings });
    }
    if (this.getThingsPromise) {
      return this.getThingsPromise.then((things: ThingMap) => {
        return things;
      });
    }
    this.getThingsPromise = ThingSchema.find({}).then(things => {
      this.getThingsPromise = undefined;

      this.things = {};
      this.simulatedThings = {};
      things.forEach((thing: any) => {
        const t = Thing.fromDescription(thing.description);
        if (t.isSimulated()) {
          this.simulatedThings[t.id] = t;
        } else {
          this.things[t.id] = t;
        }
      });

      return { ...this.things, ...this.simulatedThings };
    });
    return this.getThingsPromise;
  }

  /**
   * Get a thing by id
   * @param {string} id
   * @return {Promise<Rule>}
   */
  async getThing(id: string): Promise<Thing> {
    try {
      const thing = (await this.getThings())[id];
      if (!thing) {
        return Promise.reject(new Error(`Thing ${id} does not exist`));
      } else return Promise.resolve(thing);
    } catch (error) {
      return Promise.reject(new Error(`Thing ${id} does not exist`));
    }
  }

  /**
   * Create a new Thing with the given ID and description.
   *
   * @param String id ID to give Thing.
   * @param Object description Thing description.
   */
  async createThing(id: string, description: any): Promise<Thing> {
    const thing = Thing.fromDescription({ ...description, id });
    try {
      await ThingSchema.create(thing.id, thing.asThingDescription());
      this.addThing(thing);
      return thing;
    } catch (error) {
      return Promise.reject(new Error(`Error creating Thing ${id}`));
    }
  }

  /**
   * Add a thing to the registry
   *
   * @param Thing thing definition.
   */
  addThing(thing: Thing) {
    if (thing.isSimulated()) {
      this.simulatedThings[thing.id] = thing;
    } else {
      this.things[thing.id] = thing;
    }
  }

  /**
   * Get Thing Descriptions for all Things stored in the database.
   *
   * @return {Promise} which resolves with a list of Thing Descriptions.
   */
  async getThingDescriptions(): Promise<any> {
    try {
      const things = await this.getThings();
      const descriptions = [];
      for (const key in things) {
        const thing = things[key];
        descriptions.push(thing.asThingDescription());
      }
      return descriptions;
    } catch (error) {
      return Promise.reject(new Error(`Error obtaining things description.`));
    }
  }

  /**
   * Get a Thing description for a thing by its ID.
   *
   * @param {String} id The ID of the Thing to get a description of.
   * @return {Promise<any>} A Thing description object.
   */
  getThingDescription(id: string): Promise<any> {
    return this.getThing(id).then(thing => {
      return thing.asThingDescription();
    });
  }

  /**
   * Remove a Thing.
   *
   * @param String id ID to give Thing.
   */
  async removeThing(id: string) {
    try {
      const thing = await this.getThing(id);
      if (thing.isSimulated()) {
        delete this.simulatedThings[thing.id];
      } else {
        delete this.things[id];
      }

      return await ThingSchema.findByIdAndDelete(id);
    } catch (error) {
      return Promise.reject(new Error(`Error removing Thing ${id}`));
    }
  }

  /**
   * @param {String} thingId
   * @param {String} propertyName
   * @return {Promise<any>} resolves to value of property
   */
  async getThingProperty(thingId: string, propertyName: string): Promise<any> {
    try {
      const thing = await this.getThing(thingId);
      return thing.getPropertyValue(propertyName);
    } catch (error) {
      return Promise.reject(
        new Error(
          `Error getting value for thingId: ${thingId}, property: ${propertyName}.`
        )
      );
    }
  }

  /**
   * @param {String} thingId
   * @param {String} propertyName
   * @param {any} value
   * @return {Promise<any>} resolves to new value
   */
  async setThingProperty(
    thingId: any,
    propertyName: string,
    value: any
  ): Promise<any> {
    try {
      const thing = await this.getThing(thingId);
      if (!thing.hasProperty(propertyName)) {
        return Promise.reject(
          new Error(`Thing doesn't have specifiec property.`)
        );
      }

      const property = thing.properties.get(propertyName);
      if (property) {
        property.setValue(value);
        return property.getValue();
      }
    } catch (e) {
      return Promise.reject(
        new Error(
          `Error setting value for thing: ${thingId}, property: ${propertyName}, value: ${value}.`
        )
      );
    }
  }

  private consume(_topic: string, msg: Buffer) {
    if (msg !== null) {
      console.log(msg);
      const obj = JSON.parse(msg.toString());

      const thing = Thing.fromDescription(obj);
      console.log(thing);

      this.addThing(thing);
    }
  }
}

export const DeviceRegistrySingleton = new DeviceRegistry();
