export interface ThingLink {
  href: string;
}

export interface ThingProperty {
  id: string;
  type: string;
  "@type"?: string;
  title: string;
  unit: string;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  description: string;
  readOnly: boolean;
  links: ThingLink[];
}

export interface ThingAction {
  title: string;
  description: string;
}

export interface ThingEvent {
  "@type"?: string;
  title: string;
  description: string;
  type: string;
  unit: string;
  links: ThingLink[];
}

export interface Thing {
  id: string;
  "@context"?: string;
  "@type"?: string | string[];
  name: string;
  description: string;
  href: string;
  properties: ThingProperty[];
  actions: ThingAction[];
  events: ThingEvent[];
  links: ThingLink[];
}
