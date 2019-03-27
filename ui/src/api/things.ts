import axios from "./axios";
import { Thing } from "../models/Thing";
import { ThingProperties } from "../store/reducers/properties";
import { ThingMap } from "../store/reducers/things";

export async function fetchThings(): Promise<ThingMap> {
  function generateIdFromHref(href: string) {
    return href.replace(/\/$/g, "").replace(/[:/]/g, "-");
  }

  const { data }: { data: Array<Thing> } = await axios.get("/things");

  data.forEach((thing: Thing) => (thing.id = generateIdFromHref(thing.href)));

  const map: ThingMap = {};

  data.forEach(thing => (map[thing.id] = thing));

  return map;
}

export async function fetchThingProperties(
  thingId: string
): Promise<ThingProperties> {
  const { data } = await axios.get(`/things/${thingId}/properties`);

  return {
    id: thingId,
    properties: data
  };
}
