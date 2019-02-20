import { Property } from "./property";
import { Action } from "./action";
import { Event } from "./event";
import { Link, ILink } from "./link";
import { ActionRequest } from "./actionRequest";
import * as amqp from "../amqp";

import Ajv from "ajv";
const ajv = new Ajv();

/**
 * The Thing Description provides a vocabulary for describing physical devices connected to the World Wide Web
 * in a machine readable format with a default JSON encoding.
 */
export class Thing {
  context?: string;
  type?: string[] = [];
  name: string;
  description: string;
  properties: Map<string, Property> = new Map<string, Property>();
  actions: Map<string, Action> = new Map<string, Action>();
  events: Map<string, Event> = new Map<string, Event>();
  links: Link[] = [];

  actionsQueue: ActionRequest[] = [];

  /**
   *
   * @param {String} name Human friendly string which describes the device.
   * @param {String} description Human friendly string which describes the device and its functions.
   * @param {String} context Optional annotation which can be used to provide a URI for a schema repository which defines standard schemas for common "types" of device capabilities.
   * @param {String} type Optional annotation which can be used to provide the names of schemas for types of capabilities a device supports, from a schema repository referred to in the @context member.
   */
  constructor(
    name: string,
    description: string,
    context?: string,
    type?: string[]
  ) {
    this.name = name;
    this.description = description;
    this.context = context;
    this.type = type;
  }

  addProperties(properties: any): void {
    for (const key in properties) {
      const obj = properties[key];
      const p = new Property(key, obj.title, obj.description, obj["@type"]);

      p.defineMetadata({
        type: obj.type,
        unit: obj.unit,
        enum: obj.enum,
        readOnly: obj.readOnly,
        minimum: obj.minimum,
        maximum: obj.maximum,
        multipleOf: obj.multipleOf
      });
      p.addLinks(obj.links);
      p.on("update", () => this.propertyNotify(p.id));

      this.properties.set(key, p);
    }
  }

  addActions(actions: any): void {
    for (const key in actions) {
      const obj = actions[key];
      const a = new Action(key, obj.title, obj.description);
      a.defineInput(obj.input);
      a.addLinks(obj.links);

      this.actions.set(key, a);
    }
  }

  addEvents(events: any): void {
    for (const key in events) {
      const obj = events[key];
      const e = new Event(
        key,
        obj.title,
        obj.description,
        obj["@type"]
      );
      e.defineMetadata({
        type: obj.type,
        unit: obj.unit,
        minimum: obj.minimum,
        maximum: obj.maximum,
        multipleOf: obj.multipleOf
      });
      e.addLinks(obj.links);

      this.events.set(key, e);
    }
  }

  addLinks(links: ILink[]): void {
    links.forEach((linkData: ILink) => {
      const link = new Link(linkData);
      this.links.push(link);
    });
  }

  /**
   *
   */
  public getProperties() {
    const propsValues: { [key: string]: number } = {};
    this.properties.forEach((p: Property, key: string) => {
      propsValues[key] = p.getValue();
    });
    return propsValues;
  }

  /**
   *
   * @param id
   */
  public getPropertyValue(id: string): any {
    const p = this.properties.get(id);
    if (p) {
      return p.getValue();
    }

    throw new Error("Property specified doesn't exists");
  }

  /**
   *
   * @param id
   * @param propertyValue
   */
  public setProperty(id: string, propertyValue: any): void {
    const p = this.properties.get(id);
    if (p) {
      p.setValue(propertyValue);
    } else {
      throw new Error("Property specified doesn't exists");
    }
  }

  /**
   * Requests an action to be executed.
   *
   * @param {String} actionName Name of the action
   * @param {} input Action inputs
   * @returns {ActionRequest} The action that was created.
   */
  requestAction(actionId: string, input?: any): ActionRequest | undefined  {
    const action = this.actions.get(actionId);
    if (!action) {
      return;
    }

    if (action.input && action.input.properties) {
      const valid = ajv.validate(action.input.properties, input);

      if (!valid) {
        return;
      }

      const actionRequest = new ActionRequest(this, actionId, input);
      this.actionsQueue.push(actionRequest);

      return actionRequest;
    }

    const actionRequest = new ActionRequest(this, actionId, input);
    this.actionsQueue.push(actionRequest);
    return actionRequest;
  }

  /**
   * Cancel an action currently in the process of being executed.
   *
   * @param {String} actionName Name of the action
   */
  cancelAction(actionId: string): void  {
    const actionRequest = this.actionsQueue.find(x => x.id === actionId);
    if (!actionRequest) {
      return;
    }


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
        [p.id]: p.getValue(),
      };
      amqp.publishMessage(data);
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
      data: actionRequest,
    };
    amqp.publishMessage(data);
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
            "timestamp": new Date().toISOString()
          }
        },
      };
      amqp.publishMessage(data);
    }
  }

  /**
   * Get the available events for this thing
   */
  getEvents() {
    return this.events;
  }

  /**
   * Get the available actions for this thing
   */
  getActions() {
    return this.actions;
  }
}
