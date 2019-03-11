import { ILink, Link } from "./Link";
import EventEmitter from "events";
import Ajv from "ajv";

const ajv = new Ajv();

export interface IPropertyMetadata {
  semanticType?: string;
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
  type: string;

  metadata?: IPropertyMetadata;
  value: any;
  valueGenerator: Function;

  links: Link[] = [];

  /**
   *
   * @param {String} id Property identifier
   * @param {String} title Human friendly name
   * @param {String} description Human friendly description
   * @param {String} type A primitive type
   */
  constructor(
    id: string,
    title: string,
    description: string,
    type: string
  ) {
    super();
    this.id = id;
    this.title = title;
    this.description = description;
    this.type = type;

    this.value = 0;
    this.valueGenerator = (value: any): any => {
      return value;
    };
  }

  /**
   * Get the property description.
   *
   * @returns {Object} Description of the property as an object.
   */
  asPropertyDescription() {
    let data: any = {
      title: this.title,
      description: this.description
    };

    data = { ...data, ...this.metadata };
    data.links = this.links;

    return data;
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
    if (
      this.metadata &&
      this.metadata.hasOwnProperty("readOnly") &&
      this.metadata.readOnly
    ) {
      throw new Error("Property is defined as read-only.");
    }

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
    if (typeof v !== "undefined" && v !== null && v !== this.value) {
      this.value = v;
      super.emit("update", v);
    }
  }

  /**
   *
   * @param {any} newValue Value to be checked against the metadata
   */
  validateValue(newValue: any): Boolean {
    if (this.metadata) {
      /* As long as AJV is not compiled asynchronously, this assertion holds
       * More info: https://github.com/epoberezkin/ajv#validateobject-schemastring-keystring-ref-data---boolean */
      return ajv.validate(this.metadata, newValue) as boolean;
    }
    return true;
  }
}
