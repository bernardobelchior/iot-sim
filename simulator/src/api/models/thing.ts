import { Property } from './property';
import { Action } from './action';
import { Event } from './event';
import { Link } from './link';

/**
 * The Thing Description provides a vocabulary for describing physical devices connected to the World Wide Web
 * in a machine readable format with a default JSON encoding.
 */
export class Thing {
  private context?: string;
  private type?: string[] = [];
  private name: string;
  private description: string;
  private properties: Map<string, Property>;
  private actions: Map<string, Action>;
  private events: Map<String, Event>;
  private links: Link[] = [];

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
}
