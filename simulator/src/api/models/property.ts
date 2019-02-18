import { Link } from './link';

/**
 * A property object describes an attribute of a Thing and is indexed by a property id.
 */
export class Property {
  id: string;
  title: string;
  description: string;
  unit: string;

  type: string = null;
  semanticType: string;

  enum?: number[] = [];
  readOnly?: boolean = false;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;

  links: Link[] = [];

  /**
   *
   * @param {String} id Property identifier
   * @param {String} title Human friendly name
   * @param {String} description Human friendly description
   * @param {String} unit SI unit
   * @param {String} semanticType String identifying a type from the linked context
   * @param {String} type Identifies the data type
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

  defineMetadata(): any {
  }
}
