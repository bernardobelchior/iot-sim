import Property from './property';
import Action from './action';
import Event from './event';
import Link from './link';

class Thing {
  context?: string;
  type?: string;
  name: string;
  description: string;
  properties: Map<string, Property>;
  actions: Map<string, Action>;
  events: Map<String, Event>;
  links: [Link];

  constructor() {

  }
}