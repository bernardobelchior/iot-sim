import { Link } from './link';

/**
 * An action object describes a function which can be carried out on a device
 */
export class Action {
  id: string;
  title: string;
  description: string;
  links: Link[] = [];
  input: string; // TODO define

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

  addLinks(links: any): any {
    links.forEach((obj: any) => {
      const l = new Link(obj.href, obj.rel, obj.mediatype || null);
      this.links.push(l);
    });
  }

  defineInput(input: any): any {
  }
}