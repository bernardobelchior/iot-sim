import { ILink, Link } from "./Link";
import StrictEventEmitter from "strict-event-emitter-types";
import { EventEmitter } from "events";

export interface Events {
  update: (value: any) => void;
}

import Ajv from "ajv";
import { ValueGenerator } from "./ValueGenerator";

const ajv = new Ajv();

export interface IPropertyMetadata {
  semanticType?: string;
  unit?: string;
  enum?: any[];
  readOnly?: boolean;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;

  [key: string]: any;
}

type PropertyEmitter = StrictEventEmitter<EventEmitter, Events>;

/**
 * A property object describes an attribute of a Thing and is indexed by a property id.
 */
export class Property extends (EventEmitter as { new (): PropertyEmitter }) {
  id: string;
  title: string;
  description: string;
  type: string;

  metadata?: IPropertyMetadata;
  valueGenerator?: ValueGenerator;
  value: any = undefined;

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
  }

  /**
   * Get the property description.
   *
   * @returns {Object} Description of the property as an object.
   */
  asPropertyDescription() {
    let data: any = {
      title: this.title,
      description: this.description,
      type: this.type,
    };

    data = { ...data, ...this.metadata };

    if (data.hasOwnProperty("semanticType")) {
      data["@type"] = data.semanticType;
      delete(data.semanticType);
    }
    data.links = this.links;

    return data;
  }

  /**
   * Add a set of relationships to the property
   * @param {ILink} links Array of objects containing links
   */
  addLinks(href: string, links: ILink[]): void {
    if (Array.isArray(links)) {
      links.forEach((linkData: ILink) => {
        linkData.href = `${href}${linkData.href}`;
        this.links.push(new Link(linkData));
        this.links.push(new Link({ ...linkData, rel: "property" }));
      });
    }
  }

  initValue(value: any): any {
    this.value = value;
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
    this.valueGenerator = new ValueGenerator(this.type, this.metadata);
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
      throw new Error(`Property ${this.id} is defined as read-only.`);
    }

    const valid = this.validateValue(newValue);
    if (valid) {
      this.notifyValue(newValue);
    } else {
      throw new Error(ajv.errorsText());
    }
  }

  /**
   * Defines a new value forwarder
   * @param {Function} g Function that define the method to update the value
   */
  setValueGenerator(g: Function) {
    // this.valueGenerator = g;
  }

  /**
   * Notify observers of a value.
   *
   * @param v
   */
  notifyValue(v: any) {
    if (typeof v !== "undefined" && v !== null && v !== this.value) {
      this.value = v;
      this.emit("update", v);
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
