export interface ILink {
  href: string;
  rel?: string;
  mediatype?: string;
}

/**
 * A link object represents a link relation
 */
export class Link {
  href: string;
  rel?: string;
  mediatype?: string;

  /**
   *
   * @param {String} href A string representation of a URL
   * @param {String} rel A string describing a relationship
   * @param {String} mediatype A string identifying a media type
   */
  constructor(data: ILink) {
    this.href = data.href;
    this.rel = data.rel;
    this.mediatype = data.mediatype;
  }

  /**
   * Set the relationship associated to the link
   * @param {String} rel The relationship parameter
   */
  setRel(rel: string): void {
    this.rel = rel;
  }
}
