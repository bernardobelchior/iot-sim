import fs from "fs";
import { Thing } from "./models/Thing";

export interface IEnvironment {
  // other general configs
  things: Thing[];
  spatial: string[];
}

/**
 * Reads the physical configuration and sensors configuration
 * Validates the settings
 * Returns the entities
 */

export function builder(): IEnvironment {
  const path = `${process.cwd()}/src/environment`;

  const things: Thing[] = readSensorsConfigs(`${path}/sensors.json`);
  const spatial = readSpatialConfigs(`${path}/spatial.json`);
  return { things, spatial };
}

export function parseWebThing(obj: any): Thing {
  const context: string | undefined = obj["@context"];
  let type: string[] = [];

  if ("@type" in obj) {
    if (Array.isArray(obj["@type"])) {
      type = obj["@type"];
    } else {
      type = [obj["@type"]];
    }
  }
  const t = new Thing(obj.name, obj.description, context, type);

  t.addProperties(obj.properties || []);
  t.addActions(obj.actions || []);
  t.addEvents(obj.events || []);
  t.addLinks(obj.links || []);

  return t;
}

const readSensorsConfigs = (filePath: string): Thing[] => {
  const data = JSON.parse(fs.readFileSync(filePath).toString());

  // Parse general configs

  // Parse IoT things definition
  return data.things.map(parseWebThing);
};

const readSpatialConfigs = (filePath: string): [] => {
  return [];
};
