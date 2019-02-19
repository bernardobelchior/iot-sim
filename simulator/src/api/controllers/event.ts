import { Link, ILink } from './link';


interface IEventMetadata {
  type?: string;
  unit?: string;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;

  [key: string]: any;
}

/**
 * An event object describes a kind of event which may be emitted by a device
 */
export class Event {
  id: string;
  title: string;
  description: string;
  semanticType: string;

  metadata?: IEventMetadata;

  links: Link[] = [];

  /**
   *
   * @param {String} title Human friendly name
   * @param {String} description Human friendly description
   * @param {String} semanticType String identifying a type from the linked context
   */
  constructor(id: string, title: string, description: string, semanticType: string) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.semanticType = semanticType;
  }

  defineMetadata(metadata: IEventMetadata) {
    Object.keys(metadata).forEach((key: string) =>
      metadata[key] === undefined ? delete metadata[key] : ""
    );
    this.metadata = metadata;
  }

  addLinks(links: ILink[]): any {
    if (Array.isArray(links)) {
      links.forEach((linkData: ILink) => {
        let link = new Link(linkData);
        link.setRel('event');
        this.links.push(link);
      });
    }
  }
}
