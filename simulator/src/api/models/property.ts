import { Link, ILink } from './link';

/**
 * A property object describes an attribute of a Thing and is indexed by a property id.
 */
export class Property {
  id: string;
  title: string;
  description: string;

  type: string = null;
  semanticType: string;

  unit?: string;
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
   * @param {String} semanticType String identifying a type from the linked context
   * @param {String} type Identifies the data type
   */
  constructor(id: string, title: string, description: string, semanticType: string, type?: string) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.semanticType = semanticType;
    this.type = type;
  }

  addLinks(links: ILink[]): any {
    links.forEach((linkData: ILink) => {
      const link = new Link(linkData);
      this.links.push(link);
    });
  }

  defineMetadata(): any {
  }
}
