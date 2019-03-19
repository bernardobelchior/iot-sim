import { Property } from "./Property";
import { Action } from "./Action";
import { Event } from "./Event";
import { Link, ILink } from "./Link";
import { ActionRequest } from "./ActionRequest";
import { MessageQueue } from "../MessageQueue";

import Ajv from "ajv";
const ajv = new Ajv();

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
  actions: Map<string, Action> = new Map<string, Action>();
  events: Map<string, Event> = new Map<string, Event>();
  links: Link[] = [];

  actionsQueue: ActionRequest[] = [];

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
    this.href = this.href = `/things/${this.id}`;
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
    t.addLinks(desc.links || []);

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
      delete thing.actions[key]["id"];
    });

    this.events.forEach((value: Event, key: string) => {
      thing.events[key] = JSON.parse(JSON.stringify(value));
      delete thing.events[key]["id"];
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
      const p = new Property(key, obj.title, obj.description, obj.type);

      if (obj.hasOwnProperty("value")) {
        p.initValue(obj.value);
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
      const a = new Action(key, obj.title, obj.description);
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
      const e = new Event(key, obj.title, obj.description, obj["@type"]);
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
   *
   * @param links
   */
  addLinks(links: ILink[]): void {
    links.forEach((linkData: ILink) => {
      const link = new Link(linkData);
      this.links.push(link);
    });
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
  hasProperty(propertyName: string) {
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
   * Requests an action to be executed.
   *
   * @param {String} actionName Name of the action
   * @param {} input Action inputs
   * @returns {ActionRequest} The action that was created.
   */
  requestAction(actionName: string, input?: any): ActionRequest | undefined {
    const action = this.actions.get(actionName);
    if (!action) {
      return;
    }

    if (action.input && action.input.properties) {
      const valid = ajv.validate(action.input.properties, input);

      if (!valid) {
        return;
      }

      const actionRequest = new ActionRequest(this, actionName, input);
      this.actionsQueue.push(actionRequest);

      return actionRequest;
    }

    const actionRequest = new ActionRequest(this, actionName, input);
    this.actionsQueue.push(actionRequest);
    return actionRequest;
  }

  /**
   * Cancel an action currently in the process of being executed.
   *
   * @param {String} actionName Name of the action
   * @param {String} actionId Id of the action
   */
  cancelAction(actionName: string, actionId: string): boolean {
    const actionRequest = this.actionsQueue.find(x => x.id === actionId && x.name === actionName);
    if (!actionRequest) {
      return false;
    }
    actionRequest.cancelAction();
    return true;
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
  eventNotify(eventId: string): void {
    const event = this.events.get(eventId);

    if (event) {
      const data = {
        messageType: "event",
        data: {
          [event.id]: {
            timestamp: new Date().toISOString()
          }
        }
      };
      this.sendMessage(`${this.href}/events`, JSON.stringify(data));
    }
  }

  /**
   * Get the thing's events as an array.
   *
   * @returns {Map<string, Event>} Thing's available events.
   */
  getAvailableEvents() {
    return this.events;
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
        delete availableActions[actionName]["id"];
      }
    } else {
      this.actions.forEach((value: Action, key: string) => {
        availableActions[key] = JSON.parse(JSON.stringify(value));
        delete availableActions[key]["id"];
      });
    }
    return availableActions;
  }

  /**
   * Get an action.
   *
   * @param {String} actionName Name of the action
   * @param {String} actionId ID of the action
   * @returns {Object} The requested action if found, else null
   */
  getAction(actionName: string, actionId: string) {
    if (!this.actions.hasOwnProperty(actionName)) {
      return undefined;
    }

    return this.actionsQueue.find((x: ActionRequest) => x.id === actionId);
  }

  /**
   * Store in a database the properties current values
   */
  publishProperties() {
    // const propValues = this.getProperties();
  }

  /**
   * Returns whether or not this Thing is being simulated.
   * If it is, then the `@type` key will have `Simulated` as a value.
   */
  isSimulated() {
    return this.type.find(t => t === "Simulated");
  }

  removeEventSubscription(onEvent: (eventName: string) => void): any {
    throw new Error("Method not implemented.");
  }

  getEventDescriptions(eventName?: string): any {
    throw new Error("Method not implemented.");
  }

  addEventSubscription(onEvent: (eventName: string) => void): any {
    throw new Error("Method not implemented.");
  }

  sendMessage(topic: string, data: string) {
    if (this.messageQueue) {
      this.messageQueue.publish(topic, data);
    }
  }

  consumeMessage(_topic: string, msg: Buffer) {

  }

  start(messageQueue: MessageQueue): any {
    if (!this.messageQueue) {
      this.messageQueue = messageQueue;
    }

    this.messageQueue.subscribe(this.href, this.consumeMessage.bind(this));
  }

}
