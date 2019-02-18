import { Link, ILink } from './link';

/**
 * An event object describes a kind of event which may be emitted by a device
 */
export class Event {
  id: string;
  title: string;
  description: string;

  semanticType: string;
  type: string = null;

  unit?: string;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;

  links: Link[] = [];

  /**
   *
   * @param {String} title Human friendly name
   * @param {String} description Human friendly description
   * @param {String} semanticType String identifying a type from the linked context
   */
  constructor(id: string, title: string, description: string, semanticType: string, type?: string) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.semanticType = semanticType;
    this.type = type;
  }

  defineMetadata(metadata: { unit?: string; minimum?: number; maximum?: number; multipleOf?: number }) {
    this.unit = metadata.unit;
    this.minimum = metadata.minimum;
    this.maximum = metadata.maximum;
    this.multipleOf = metadata.multipleOf;
  }

  addLinks(links: ILink[]): any {
    links.forEach((linkData: ILink) => {
      const link = new Link(linkData);
      this.links.push(link);
    });
  }
}
