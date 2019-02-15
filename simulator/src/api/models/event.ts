import { Link } from './link';

/**
 * An event object describes a kind of event which may be emitted by a device
 */
export class Event {
  private title: string;
  private description: string;

  private semanticType: string;
  private type: string = null;

  private unit: string;
  private minimum?: number;
  private maximum?: number;
  private multipleOf?: number;

  private links: Link[] = [];

  /**
   * 
   * @param {String} title Human friendly name
   * @param {String} description Human friendly description
   * @param {String} unit SI unit
   * @param {String} semanticType String identifying a type from the linked context
   */
  constructor(title: string, description: string, unit: string, semanticType: string) {
    this.title = title;
    this.description = description;
    this.unit = unit;
    this.semanticType = semanticType;
  }
}