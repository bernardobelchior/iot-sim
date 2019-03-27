import { Link, ILink } from "./Link";

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
  description: string;
  semanticType?: string;
  title?: string;

  metadata?: IEventMetadata;

  links: Link[] = [];

  /**
   * Event constructor
   * @param {String} title Human friendly name
   * @param {String} description Human friendly description
   * @param {String} semanticType String identifying a type from the linked context
   */
  constructor(
    description: string,
    title?: string,
    semanticType?: string
  ) {
    this.description = description;
    this.title = title;
    this.semanticType = semanticType;
  }

  /**
   * Define the event's parameters that are option
   * @param metadata
   */
  defineMetadata(metadata: IEventMetadata) {
    Object.keys(metadata).forEach((key: string) =>
      metadata[key] === undefined ? delete metadata[key] : ""
    );
    this.metadata = metadata;
  }

  /**
   * Add relationships between events and remaining entities
   * @param {ILink[]} links
   */
  addLinks(href: string, links: ILink[]): any {
    if (Array.isArray(links)) {
      links.forEach((linkData: ILink) => {
        linkData.href = `${href}${linkData.href}`;
        this.links.push(new Link(linkData));
        this.links.push(new Link({ ...linkData, rel: "event" }));
      });
    }
  }
}
