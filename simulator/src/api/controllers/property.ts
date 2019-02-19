import { Link, ILink } from "./link";
import { Value } from "./value";
import Ajv from 'ajv';
let ajv = new Ajv();

export interface IPropertyMetadata {
  type: string;
  unit?: string;
  enum?: number[];
  readOnly?: boolean;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;

  [key: string]: any;
}

/**
 * A property object describes an attribute of a Thing and is indexed by a property id.
 */
export class Property {
  id: string;
  title: string;
  description: string;
  semanticType: string;

  metadata?: IPropertyMetadata;
  value: Value;

  links: Link[] = [];

  /**
   *
   * @param {String} id Property identifier
   * @param {String} title Human friendly name
   * @param {String} description Human friendly description
   * @param {String} semanticType String identifying a type from the linked context
   */
  constructor(
    id: string,
    title: string,
    description: string,
    semanticType: string
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.semanticType = semanticType;
    this.value = new Value(0);
  }

  /**
   * Add a set of relationships to the property
   * @param {ILink} links Array of objects containing links
   */
  addLinks(links: ILink[]): void {
    if (Array.isArray(links)) {
      links.forEach((linkData: ILink) => {
        let link = new Link(linkData);
        link.setRel("property");
        this.links.push(link);
      });
    }
  }

  /**
   *
   * @param {IPropertyMetadata} metadata
   */
  defineMetadata(metadata: IPropertyMetadata): void {
    Object.keys(metadata).forEach((key: string) =>
      metadata[key] === undefined ? delete metadata[key] : ""
    );
    this.metadata = metadata;
  }

  /**
   * Get the property current value
   */
  getValue(): any {
    return this.value.get();
  }

  /**
   * Set the property current value
   */
  setValue(newValue: any): void {
    this.validateValue(newValue);
    this.value.set(newValue);
  }

  /**
   * 
   * @param {Any} newValue Value to be checked against the metadata
   */
  validateValue(newValue: any): void {
    if (this.metadata && this.metadata.hasOwnProperty('readOnly') && this.metadata.readOnly) {
      throw new Error('Property is defined as read-only.');
    }

    if (this.metadata) {
      let valid = ajv.validate(this.metadata, newValue);
      if (!valid) {
        throw new Error("Invalid property.");
      }
    }
  }
}
