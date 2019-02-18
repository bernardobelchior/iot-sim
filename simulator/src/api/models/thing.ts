import { Property } from './property';
import { Action } from './action';
import { Event } from './event';
import { Link, ILink } from './link';

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
  constructor(name: string, description: string, context?: string, type?: string[]) {
    this.name = name;
    this.description = description;
    this.context = context;
    this.type = type;
  }

  addProperties(properties: any): any {
    for (let key in properties) {
      let obj = properties[key];
      let p = new Property(key, obj.title, obj.description, obj['@type'], obj.type || null);
      p.defineMetadata();
      p.addLinks(obj.links || []);

      this.properties.set(key, p);
    }
  }

  addActions(actions: any): any {
    for (let key in actions) {
      let obj = actions[key];
      let a = new Action(key, obj.title, obj.description);
      a.defineInput(obj.input);
      a.addLinks(obj.links || []);

      this.actions.set(key, a);
    }
  }

  addEvents(events: any): any {
    for (let key in events) {
      let obj = events[key];
      let e = new Event(key, obj.title, obj.description, obj['@type'], obj.type || null);
      e.defineMetadata({ unit: obj.unit, minimum: obj.minimum, maximum: obj.maximum, multipleOf: obj.multipleOf });
      e.addLinks(obj.links || []);

      this.events.set(key, e);
    }
  }

  addLinks(links: ILink[]): any {
    links.forEach((linkData: ILink) => {
      const link = new Link(linkData);
      this.links.push(link);
    });
  }

  public getThing() {

  }

  public getProperties() {

  }

  public getProperty(id: string) {

  }

  public setProperty(id: string, propertyValue: any) {
    
  }
}
