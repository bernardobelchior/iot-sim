import { Link } from './link';

/**
 * An event object describes a kind of event which may be emitted by a device
 */
export class Event {
  id: string;
  title: string;
  description: string;

  semanticType: string;
  type: string = null;

  unit: string;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;

  links: Link[] = [];

  /**
   * 
   * @param {String} title Human friendly name
   * @param {String} description Human friendly description
   * @param {String} unit SI unit
   * @param {String} semanticType String identifying a type from the linked context
   */
  constructor(id: string, title: string, description: string, unit: string, semanticType: string, type?: string) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.unit = unit;
    this.semanticType = semanticType;
    this.type = type;
  }

  addLinks(links: any): any {
    links.forEach((obj: any) => {
      const l = new Link(obj.href, obj.rel, obj.mediatype || null);
      this.links.push(l);
    });
  }

  defineMetadata(metadata: { minimum?: number; maximum?: number; multipleOf?: number; }): any {
  
  }
}