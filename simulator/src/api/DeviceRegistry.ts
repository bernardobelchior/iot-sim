import fs from "fs";
import { Thing } from "./models/Thing";
import { MessageQueue, messageQueueBuilder } from "../MessageQueue";
import { vars } from "../util/vars";

type ThingMap = { [id: string]: Thing };

export default class DeviceRegistry {
  private simulatedThings: ThingMap = {};
  private things: ThingMap = {};
  private messageQueue?: MessageQueue;

  constructor() {}

  /**
   * Subscribes to the message queue. If this is not called, then messages
   * published to the message queue will not be consumed.
   */
  public init = async () => {
    const filePath = `${process.cwd()}/src/environment/sensors.json`;
    const data = JSON.parse(fs.readFileSync(filePath).toString());
    for (const t of data) {
      isFinite(t);

      /*       const thing = Thing.fromDescription(t);
      await this.addThing(thing); */
    }

    if (!this.messageQueue)
      this.messageQueue = await messageQueueBuilder(vars.MQ_URI);

    this.messageQueue.subscribe("register", this.consume.bind(this));
  };

  /**
   * Get map of virtual things
   * @return {ThingMap}
   */
  getSimulatedThings(): ThingMap {
    return this.simulatedThings;
  }

  /**
   * Get map of physical things
   * @return {ThingMap}
   */
  getPhysicalThings(): ThingMap {
    return this.things;
  }

  /**
   * Get things
   * @return {ThingMap}
   */
  getThings(): ThingMap {
    return { ...this.things, ...this.simulatedThings };
  }

  /**
   * Get a thing by id
   * @param {string} id
   * @return {Thing}
   */
  getThing(id: string): Thing {
    const thing = this.things[id];
    if (!thing) {
      throw new Error(`Thing ${id} does not exist`);
    } else return thing;
  }

  /**
   * Create a new Thing with the given ID and description.
   *
   * @param String id ID to give Thing.
   * @param Object description Thing description.
   */
  async createThing(id: string, description: any): Promise<Thing> {
    const t = this.things[id];
    if (t) {
      throw new Error(`Thing ${id} already exists.`);
    }
    const thing = Thing.fromDescription({ ...description, id });
    await this.addThing(thing);
    return thing;
  }

  /**
   * Add a thing to the registry
   *
   * @param Thing thing definition.
   */
  async addThing(thing: Thing) {
    const messageQueue = await messageQueueBuilder(vars.MQ_URI);
    thing.start(messageQueue);
    if (thing.isSimulated()) {
      this.simulatedThings[thing.id] = thing;
    } else {
      this.things[thing.id] = thing;
    }
  }

  /**
   * Get Thing Descriptions for all Things stored in the database.
   *
   * @return {any[]} which resolves with a list of Thing Descriptions.
   */
  getThingDescriptions(): any[] {
    const descriptions = [];
    for (const key in this.things) {
      const thing = this.things[key];
      descriptions.push(thing.asThingDescription());
    }
    return descriptions;
  }

  /**
   * Get a Thing description for a thing by its ID.
   *
   * @param {String} id The ID of the Thing to get a description of.
   * @return {any} A Thing description object.
   */
  getThingDescription(id: string): any {
    const thing = this.getThing(id);
    return thing.asThingDescription();
  }

  /**
   * Remove a Thing.
   *
   * @param String id ID to give Thing.
   */
  removeThing(id: string) {
    const thing = this.getThing(id);
    if (thing.isSimulated()) {
      delete this.simulatedThings[thing.id];
    } else {
      delete this.things[id];
    }
  }

  /**
   * @param {String} thingId
   * @param {String} propertyName
   * @return {any} resolves to value of property
   */
  getThingProperty(thingId: string, propertyName: string): any {
    const thing = this.getThing(thingId);
    return thing.getPropertyValue(propertyName);
  }

  /**
   * @param {String} thingId
   * @param {String} propertyName
   * @param {any} value
   * @return {any} resolves to new value
   */
  setThingProperty(thingId: any, propertyName: string, value: any): any {
    const thing = this.getThing(thingId);
    if (!thing.hasProperty(propertyName)) {
      throw new Error(`Thing doesn't have specified property.`);
    }

    const property = thing.properties.get(propertyName);
    if (property) {
      property.setValue(value);
      return property.getValue();
    }
  }

  setMessageQueue(messageQueue: MessageQueue) {
    this.messageQueue = messageQueue;
  }

  private async consume(_topic: string, msg: Buffer) {
    if (msg !== null) {
      const obj = JSON.parse(msg.toString());

      const thing = Thing.fromDescription(obj);
      await this.addThing(thing);
    }
  }
}
