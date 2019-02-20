import { ILink, Link } from "./link";
import EventEmitter from "events";
import Ajv from "ajv";

const ajv = new Ajv();

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
export class Property extends EventEmitter {
  id: string;
  title: string;
  description: string;
  semanticType: string;

  metadata?: IPropertyMetadata;
  value: any;
  valueGenerator: Function;

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
    super();
    this.id = id;
    this.title = title;
    this.description = description;
    this.semanticType = semanticType;

    this.value = 0;
    this.valueGenerator = (value: any): any => {
      return value;
    };


    setInterval(() => {
      const newValue = this.valueGenerator(1);
      this.setValue(newValue);
    }, 2000);

  }

  /**
   * Add a set of relationships to the property
   * @param {ILink} links Array of objects containing links
   */
  addLinks(links: ILink[]): void {
    if (Array.isArray(links)) {
      links.forEach((linkData: ILink) => {
        const link = new Link(linkData);
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
    return this.value;
  }

  /**
   * Set the property current value
   */
  setValue(newValue: any): void {
    const valid = this.validateValue(newValue);
    if (valid) {
      this.notifyValue(newValue);
    }
  }

  /**
   * Defines a new value forwarder
   * @param {Function} g Function that define the method to update the value
   */
  setValueGenerator(g: Function) {
    this.valueGenerator = g;
  }

  /**
   * Notify observers of a value.
   *
   * @param v
   */
  notifyValue(v: any) {
    if (typeof v !== "undefined" &&
      v !== null &&
      v !== this.value) {
      this.value = v;
      super.emit("update", v);
    }
  }

  /**
   *
   * @param {any} newValue Value to be checked against the metadata
   */
  validateValue(newValue: any): Boolean {
    /*     if (this.metadata && this.metadata.hasOwnProperty('readOnly') && this.metadata.readOnly) {
          throw new Error('Property is defined as read-only.');
        } */

    if (this.metadata) {
      /* As long as AJV is not compiled asynchronously, this assertion holds
       * More info: https://github.com/epoberezkin/ajv#validateobject-schemastring-keystring-ref-data---boolean */
      return ajv.validate(this.metadata, newValue) as boolean;
    }
    return true;
  }
}