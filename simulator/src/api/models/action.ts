import { Link } from './link';

/**
 * An action object describes a function which can be carried out on a device
 */
export class Action {
  private title: string;
  private description: string;
  private links: Link[] = [];
  private input: string; // TODO define

  /**
   * 
   * @param {String} title Human friendly name
   * @param {String} description Human friendly description
   */
  constructor(title: string, description: string) {
    this.title = title;
    this.description = description;
  }
}