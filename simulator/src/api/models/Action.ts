import { Link, ILink } from "./Link";

export interface IInputProperty {
  type: string;
  unit?: string;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
}

export interface IInput {
  "@type": string;
  type: string;
  properties?: { [property: string]: IInputProperty };
}

/**
 * An action object describes a function which can be carried out on a device
 */
export class Action {
  title: string;
  description: string;
  links: Link[] = [];
  input?: IInput;

  /**
   *
   * @param {String} title Human friendly name
   * @param {String} description Human friendly description
   */
  constructor(title: string, description: string) {
    this.title = title;
    this.description = description;
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
        this.links.push(new Link({ ...linkData, rel: "action" }));
      });
    }
  }

  /**
   *
   * @param {IInput} inputData
   */
  defineInput(inputData: IInput): any {
    if (inputData !== undefined) {
      this.input = inputData;
    }
  }
}
