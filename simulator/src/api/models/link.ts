/**
 * A link object represents a link relation
 */
export class Link {
  private href: string;
  private rel: string;
  private mediatype?: string;

  /**
   *
   * @param {String} href A string representation of a URL
   * @param {String} rel A string describing a relationship
   * @param {String} mediatype A string identifying a media type
   */
  constructor(href: string, rel: string, mediatype?: string) {
    this.href = href;
    this.rel = rel;
    this.mediatype = mediatype;
  }
}
