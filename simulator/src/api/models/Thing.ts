import { Property } from "./Property";
import { Action } from "./Action";
import { Event } from "./Event";
import { Link } from "./Link";
import { ActionRequest } from "./ActionRequest";
import { MessageQueue } from "../MessageQueue";

import Ajv from "ajv";
import { timestamp } from "./ValueGenerator";
const ajv = new Ajv();

type EventDispatched = { name: string,  data?: any, time: string };

/**
 * The Thing Description provides a vocabulary for describing physical devices connected to the World Wide Web
 * in a machine readable format with a default JSON encoding.
 */
export class Thing {
  context?: string;
  type: string[] = [];
  id: string;
  name: string;
  href: string;
  description: string;
  properties: Map<string, Property> = new Map<string, Property>();
  actions: Map<string, Action> = new Map<string, Action>(); // available actions
  events: Map<string, Event> = new Map<string, Event>(); // available events
  links: Link[] = [];

  actionsRequests: ActionRequest[] = [];
  eventsDispatched: EventDispatched[] = [];

  messageQueue?: MessageQueue;

  /**
   *
   * @param {String} name Human friendly string which describes the device.
   * @param {String} description Human friendly string which describes the device and its functions.
   * @param {String} id Thing identifier
   * @param {String} context Optional annotation which can be used to provide a URI for a schema repository which defines standard schemas for common "types" of device capabilities.
   * @param {String} type Optional annotation which can be used to provide the names of schemas for types of capabilities a device supports, from a schema repository referred to in the @context member.
   */
  constructor(name: string, description: string, id: string, context?: string, type?: string[]) {
    this.name = name;
    this.id = id;
    this.description = description;
    this.context = context;
    this.type = type || [];
    // Removed first slash so that the queues created don't have an extra topic
    // https://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices/
    this.href = this.href = `things/${this.id}`;
  }

  static fromDescription(desc: any): Thing {
    const context: string | undefined = desc["@context"];
    let type: string[] = [];

    if ("@type" in desc) {
      if (Array.isArray(desc["@type"])) {
        type = desc["@type"];
      } else {
        type = [desc["@type"]];
      }
    }

    const t = new this(desc.name, desc.description, desc.id, context, type);

    t.addProperties(desc.properties || []);
    t.addActions(desc.actions || []);
    t.addEvents(desc.events || []);

    if (desc.links && Array.isArray(desc.links)) {
      for (const linkData of desc.links) {
        const link = new Link(linkData);
        t.links.push(link);
      }
    }

    return t;
  }

  /**
   * Return the thing state as a Thing Description.
   *
   * @returns {Object} Current thing state
   */
  asThingDescription(): object {
    const thing: any = {
      name: this.name,
      description: this.description,
      href: this.href,
      "@context": this.context,
      "@type": this.type,
      properties: this.getPropertyDescriptions(),
      actions: {},
      events: {},
      links: [
        {
          rel: "properties",
          href: `${this.href}/properties`
        },
        {
          rel: "actions",
          href: `${this.href}/actions`
        },
        {
          rel: "events",
          href: `${this.href}/events`
        }
      ]
    };

    this.actions.forEach((value: Action, key: string) => {
      thing.actions[key] = JSON.parse(JSON.stringify(value));
    });

    this.events.forEach((value: Event, key: string) => {
      thing.events[key] = JSON.parse(JSON.stringify(value));
    });

    return thing;
  }

  /**
   *
   * @param properties
   */
  addProperties(properties: any): void {
    for (const key in properties) {
      const obj = properties[key];
      const p = new Property(key, obj.description, obj.type, obj.title);

      if (obj.hasOwnProperty("value")) {
        p.notifyValue(obj.value);
      }

      p.defineMetadata({
        semanticType: obj["@type"],
        unit: obj.unit,
        enum: obj.enum,
        readOnly: obj.readOnly,
        minimum: obj.minimum,
        maximum: obj.maximum,
        multipleOf: obj.multipleOf
      });
      p.addLinks(this.href, obj.links);
      p.on("update", () => this.propertyNotify(p.id));

      this.properties.set(key, p);
    }
  }

  /**
   *
   * @param actions
   */
  addActions(actions: any): void {
    for (const key in actions) {
      const obj = actions[key];
      const a = new Action(obj.title, obj.description);
      a.defineInput(obj.input);
      a.addLinks(this.href, obj.links);

      this.actions.set(key, a);
    }
  }

  /**
   *
   * @param events
   */
  addEvents(events: any): void {
    for (const key in events) {
      const obj = events[key];
      const e = new Event(obj.description, obj.title, obj["@type"]);
      e.defineMetadata({
        type: obj.type,
        unit: obj.unit,
        minimum: obj.minimum,
        maximum: obj.maximum,
        multipleOf: obj.multipleOf
      });
      e.addLinks(this.href, obj.links);

      this.events.set(key, e);
    }
  }

  /**
   * Get the thing's properties as an object.
   *
   * @returns {Object} Properties, i.e. name -> description
   */
  getPropertyDescriptions() {
    const descriptions: any = {};
    this.properties.forEach((value: Property, key: string) => {
      descriptions[key] = value.asPropertyDescription();
    });

    return descriptions;
  }

  /**
   * Get the thing's actions as an array.
   *
   * @param {String?} actionName Optional action name to get descriptions for
   *
   * @returns {Object} Action descriptions.
   */
  getActionDescriptions(actionName?: string) {
    const availableActions: any = {};
    if (actionName !== undefined) {
      const action = this.actions.get(actionName);
      if (action !== undefined) {
        availableActions[actionName] = JSON.parse(JSON.stringify(action));
      }
    } else {
      this.actions.forEach((value: Action, key: string) => {
        availableActions[key] = JSON.parse(JSON.stringify(value));
      });
    }
    return availableActions;
  }

  /**
   * Get the thing's events as an array.
   *
   * @param {String?} eventName Optional event name to get descriptions for
   *
   * @returns {Object} Event descriptions.
   */
  getEventDescriptions(eventName?: string): any {
    const availableEvents: any = {};
    if (eventName !== undefined) {
      const event = this.events.get(eventName);
      if (event !== undefined) {
        availableEvents[eventName] = JSON.parse(JSON.stringify(event));
      }
    } else {
      this.events.forEach((value: Event, key: string) => {
        availableEvents[key] = JSON.parse(JSON.stringify(value));
      });
    }
    return availableEvents;
  }

  /**
   * Get a mapping of all properties and their values.
   *
   * Returns an object of propertyName -> value.
   */
  getProperties() {
    const propsValues: { [key: string]: number } = {};
    this.properties.forEach((p: Property, key: string) => {
      propsValues[key] = p.getValue();
    });
    return propsValues;
  }

  /**
   * Determine whether or not this thing has a given property.
   *
   * @param {String} propertyName The property to look for
   *
   * @returns {Boolean} Indication of property presence
   */
  hasProperty(propertyName: string): boolean {
    return this.properties.has(propertyName);
  }

  /**
   * Get a property's value
   *
   * @param {String} propertyName Name of the property to get the value of
   *
   * @returns {*} Current property value if found, else null
   */
  public getPropertyValue(id: string): any {
    const p = this.properties.get(id);
    if (p) {
      return p.getValue();
    }

    throw new Error(`Property ${id} doesn't exists`);
  }

  /**
   * Set a property's value.
   *
   * @param {String} propertyName Name of the property to get the value of
   * @param {*} propertyValue
   */
  public setProperty(propertyName: string, propertyValue: any): void {
    const p = this.properties.get(propertyName);
    if (p) {
      p.setValue(propertyValue);
    } else {
      throw new Error(`Property ${propertyName} doesn't exists`);
    }
  }

  /**
   * Obtains a list of action requests
   * @param actionName Optional arg to specify the requests to obtain
   * @returns {ActionRequest[]}
   */
  getActionRequests(actionName?: string): ActionRequest[] {
    let res: ActionRequest[] = [];
    if (actionName) {
      res = this.actionsRequests.filter(ar => ar.name === actionName);
    } else {
      res = this.actionsRequests;
    }

    return res;
  }

  checkActionRequest(actionName: string, input?: any): boolean {
    const action = this.actions.get(actionName);
    if (!action) {
      return false;
    }

    if (action.input && action.input.properties) {
      return ajv.validate(action.input.properties, input) as boolean;
    }

    return true;
  }

  /**
   * Requests an action to be executed.
   *
   * @param {String} actionName Name of the action
   * @param {} input Action inputs
   * @returns {ActionRequest} The action that was created.
   */
  requestAction(actionName: string, input?: any): ActionRequest {
    const actionRequest = new ActionRequest(this, actionName, input);
    actionRequest.startAction();
    this.actionsRequests.push(actionRequest);
    return actionRequest;
  }

  /**
   * Get an action.
   *
   * @param {String} actionName Name of the action
   * @param {String} actionId ID of the action
   * @returns {ActionRequest} The requested action if found, else null
   */
  getAction(actionName: string, actionId: string): ActionRequest {
    if (!this.actions.hasOwnProperty(actionName)) {
      throw new Error(`Action ${actionName} doesn't exist.`);
    }

    const actionRequest = this.actionsRequests.find(x => x.id === actionId && x.name === actionName);

    if (!actionRequest) {
      throw new Error(`Action ${actionName} with ID ${actionId} doesn't exist.`);
    } else return actionRequest;
  }

  /**
   * Cancel an action currently in the process of being executed.
   *
   * @param {String} actionName Name of the action
   * @param {String} actionId Id of the action
   */
  cancelAction(actionName: string, actionId: string): boolean {
    const actionRequest = this.actionsRequests.find(x => x.id === actionId && x.name === actionName);
    if (!actionRequest) {
      throw new Error(`Action ${actionName} with ID ${actionId} doesn't exist.`);
    }
    actionRequest.cancelAction();
    return true;
  }

  addEvent(eventName: string, data?: any) {
    if (!this.events.hasOwnProperty(eventName)) {
      throw new Error(`Event ${eventName} doesn't exist.`);
    }
    const e: EventDispatched = {
      name: eventName,
      time: timestamp(),
      data
    };
    this.eventsDispatched.push(e);
    this.eventNotify(e);
  }

  async addEventSubscription(eventName: string, onEvent: (event: string) => void): Promise<boolean> {
    if (this.messageQueue) {
      await this.messageQueue.subscribe(eventName, onEvent);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  async removeEventSubscription(eventName: string): Promise<boolean> {
    if (this.messageQueue) {
      await this.messageQueue.unsubscribe(eventName);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  /**
   * Push notification about property
   *
   * @param {Object} property The property
   */
  propertyNotify(propertyId: string): void {
    const p = this.properties.get(propertyId);
    if (p) {
      const data = {
        messageType: "propertyStatus",
        [p.id]: p.getValue()
      };
      this.sendMessage(`${this.href}/properties`, JSON.stringify(data));
    }
  }

  /**
   * Send to middleware a notification about an action status change.
   *
   * @param {Object} action
   */
  actionNotify(actionRequest: any): void {
    const data = {
      messageType: "actionStatus",
      data: actionRequest
    };
    this.sendMessage(`${this.href}/actions`, JSON.stringify(data));
  }

  /**
   * Send event notification to middleware
   *
   * @param {Object} event The event that occurred
   */
  eventNotify(event: EventDispatched): void {
    if (event) {
      this.eventsDispatched.push(event);
      const data = {
        messageType: "event",
        data: {
          [event.name]: {
            time: event.time,
            data: event.data
          }
        }
      };
      this.sendMessage(`${this.href}/events`, JSON.stringify(data));
    }
  }

  /**
   * Returns whether or not this Thing is being simulated.
   * If it is, then the `@type` key will have `Simulated` as a value.
   */
  isSimulated() {
    return this.type.find(t => t === "Simulated");
  }

  sendMessage(topic: string, data: string) {
    if (this.messageQueue) {
      this.messageQueue.publish(topic, data);
    }
  }

  consumeMessage(_topic: string, msg: Buffer) {

  }

  async start(messageQueue: MessageQueue): Promise<void> {
    if (!this.messageQueue) {
      this.messageQueue = messageQueue;
    }

    await this.messageQueue.subscribe(this.href, this.consumeMessage.bind(this));
  }
}
