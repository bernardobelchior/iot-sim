import { Link, ILink } from './link';

interface IInputProperty {
  type: string;
  unit?: string;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
}

interface IInput {
  '@type': string;
  type: string;
  properties?: { [property: string]: IInputProperty };
}

/**
 * An action object describes a function which can be carried out on a device
 */
export class Action {
  id: string;
  title: string;
  description: string;
  links: Link[] = [];
  input?: IInput;

  /**
   *
   * @param {String} title Human friendly name
   * @param {String} description Human friendly description
   */
  constructor(id: string, title: string, description: string) {
    this.id = id;
    this.title = title;
    this.description = description;
  }

  addLinks(links: ILink[]): any {
    links.forEach((linkData: ILink) => {
      const link = new Link(linkData);
      this.links.push(link);
    });
  }

  defineInput(inputData: IInput): any {
    if (inputData !== undefined) {
      this.input = inputData;
    }
  }
}
