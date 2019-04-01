import { Thing } from "./models/Thing";
import { MessageQueue } from "./MessageQueue";

type ThingMap = { [id: string]: Thing };

export const REGISTER_TOPIC = "__register";

export class DeviceRegistry {
  private simulatedThings: ThingMap = {};
  private things: ThingMap = {};
  private messageQueue: MessageQueue;

  constructor(messageQueue: MessageQueue) {
    this.messageQueue = messageQueue;
  }

  /**
   * Subscribes to the message queue. If this is not called, then messages
   * published to the message queue will not be consumed.
   */
  init() {
    return this.messageQueue.subscribe(REGISTER_TOPIC, this.consume.bind(this));
  }

  /**
   * Closes the message queue
   * @return {Promise<void>}
   */
  finalize() {
    return this.messageQueue.end();
  }

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
   * Get (physical and simulated) things.
   * Note: Simulated things have "priority" over physical ones,
   * as such, the physical ones won't show if there's one
   * simulated thingId with the same id.
   * @return {ThingMap}
   */
  isThingSimulated(id: string) {
    return this.getSimulatedThings()[id] !== undefined;
  }

  existsPhysicalThingWithId(id: string) {
    return this.getPhysicalThings()[id] !== undefined;
  }

  getThings(): ThingMap {
    return { ...this.things, ...this.simulatedThings };
  }

  /**
   * Get a thingId by id
   * @param {string} id
   * @return {Thing | undefined } Thing, or undefined is not found.
   */
  getThing(id: string): Thing | undefined {
    return this.getThings()[id];
  }

  hasThing(id: string): boolean {
    return this.getThing(id) !== undefined;
  }

  /**
   * Create a new Thing with the given ID and description.
   * Throws if ID already exists.
   *
   * @param {String} id ID to give Thing.
   * @param {Object} description Thing description.
   * @return {Thing} Thing
   */
  async createThing(id: string, description: object): Promise<Thing> {
    const t = this.things[id];
    if (t) {
      throw new Error(`Thing ${id} already exists.`);
    }
    const thing = Thing.fromDescription({ ...description, id });
    await this.addThing(thing);
    return thing;
  }

  /**
   * Add a thingId to the registry
   *
   * @param {Thing} thing.
   */
  addThing(thing: Thing) {
    let promise = Promise.resolve();

    /* Make sure we don't subscribe twice to the same thingId, otherwise messages
     * can be delivered twice. */
    if (!this.hasThing(thing.id)) {
      promise = this.messageQueue.subscribe(
        thing.href,
        this.consume.bind(this)
      );
    }

    if (thing.isSimulated()) {
      this.simulatedThings[thing.id] = thing;
    } else {
      this.things[thing.id] = thing;
    }

    return promise;
  }

  private consume(topic: string, msg: Buffer) {
    switch (topic) {
      case REGISTER_TOPIC:
        this.handleRegistry(topic, msg);
        break;
      default:
        this.handleWebSocketMessage(topic, msg);
        break;
    }
  }

  private handleRegistry(_topic: string, msg: Buffer) {
    const obj = JSON.parse(msg.toString());
    const thing = Thing.fromDescription(obj);
    return this.addThing(thing);
  }

  private handleWebSocketMessage(topic: string, msg: Buffer) {
    const levels = topic.split("/");

    const obj: any = JSON.parse(msg.toString());

    switch (obj.messageType) {
      case "setProperty":
      case "propertyStatus":
        const thing = this.getThing(levels[2]);

        if (thing !== undefined) {
          thing.setProperties(obj.data);
        }

        break;
      default:
        break;
    }
  }

  /**
   * @param {String} thingId
   * @param {String} propertyName
   * @return {any} resolves to value of property
   */
  getThingProperty(thingId: string, propertyName: string): any {
    const thing = this.getThing(thingId);

    if (thing === undefined) {
      return undefined;
    }

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

    if (thing === undefined) {
      throw new Error(`Thing with ID '${thingId}' doesn't exist.`);
    }

    if (!thing.hasProperty(propertyName)) {
      throw new Error(`Thing doesn't have specified property.`);
    }

    const property = thing.properties.get(propertyName);
    if (property) {
      property.setValue(value);
      return property.getValue();
    }
  }
}
