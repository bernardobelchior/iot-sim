import { Property } from "./property";
import { Action, IInputProperty } from "./action";
import { Event } from "./event";
import { Link, ILink } from "./link";
import * as amqp from '../amqp';
import Ajv from 'ajv';
let ajv = new Ajv();

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
    for (let key in properties) {
      let obj = properties[key];
      let p = new Property(key, obj.title, obj.description, obj["@type"]);

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

      this.properties.set(key, p);
    }
  }

  addActions(actions: any): void {
    for (let key in actions) {
      let obj = actions[key];
      let a = new Action(key, obj.title, obj.description);
      a.defineInput(obj.input);
      a.addLinks(obj.links);

      this.actions.set(key, a);
    }
  }

  addEvents(events: any): void {
    for (let key in events) {
      let obj = events[key];
      let e = new Event(
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

  public getProperties() {
    let propsValues: { [key: string]: number } = {};
    this.properties.forEach((p: Property, key: string) => {
      propsValues[key] = p.getValue();
    });
    return propsValues;
  }

  public getPropertyValue(id: string): any { 
    const p = this.properties.get(id);
    if(p) {
      return p.getValue();
    } 

    throw new Error('Property specified doesn\'t exists');
  }

  public setProperty(id: string, propertyValue: any): void { 
    const p = this.properties.get(id);
    if(p) {
      p.setValue(propertyValue);
      this.propertyNotify(p.id);
    } else {
      throw new Error('Property specified doesn\'t exists');
    }
  }

  /**
   * Requests an action to be executed.
   *
   * @param {String} actionName Name of the action
   * @param {IInputProperty} input Action inputs
   * @returns {Object} The action that was created.
   */
  requestAction(actionId: string, input: IInputProperty): void  {
    const action = this.actions.get(actionId);
    if (!action) {
      return;
    }

    if (action.input && action.input.properties) {
      const valid = ajv.validate(action.input.properties, input);
      // to finish. Include actions queue in device class
      if (!valid) {
        return;
      }
    }
  }

  /**
   * Push notification about property
   *
   * @param {Object} property The property
   */
  propertyNotify(propertyId: string): void {
    const p = this.properties.get(propertyId);
    if(p) {
      const data = JSON.stringify({
        messageType: 'propertyStatus',
        [p.id]: p.getValue(),
      });
      amqp.publishMessage(data);
    } 
  }

  /**
   * Send to middleware a notification about an action status change.
   *
   * @param {Object} action
   */
  actionNotify({}): void {
    const data = JSON.stringify({
      messageType: 'actionStatus',
      data: 'tbd',
    });
    amqp.publishMessage(data);
  }

  /**
   * Send event notification to middleware
   *
   * @param {Object} event The event that occurred
   */
  eventNotify(eventId: string): void {
    if (!this.events.has(eventId)) {
      return;
    }

    const data = {
      messageType: 'event',
      data: eventId,
    };
    amqp.publishMessage(data);
  }
}
