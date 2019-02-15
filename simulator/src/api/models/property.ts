import { Link } from './link';

/**
 * A property object describes an attribute of a Thing and is indexed by a property id.
 */
export class Property {
  private id: string;
  private title: string;
  private description: string;
  private unit: string;

  private type: string = null;
  private semanticType: string;
  
  private enum?: number[] = [];
  private readOnly?: boolean = false;
  private minimum?: number;
  private maximum?: number;
  private multipleOf?: number;

  private links: Link[] = [];

  /**
   * 
   * @param {String} id Property identifier
   * @param {String} title Human friendly name
   * @param {String} description Human friendly description
   * @param {String} unit SI unit
   * @param {String} semanticType String identifying a type from the linked context
   */
  constructor(id: string, title: string, description: string, unit: string, semanticType: string) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.unit = unit;
    this.semanticType = semanticType;
  }
}