import fs from 'fs';
import path from 'path';
import { Thing } from './models/thing';

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

export function Builder(): IEnvironment {
  const path = `${process.cwd()}/src/environment`;

  const things: Thing[] = readSensorsConfigs(`${path}/sensors.json`);
  const spatial = readSpatialConfigs(`${path}/spatial.json`);
  return { things, spatial };
};

const readSensorsConfigs = (filePath: string): Thing[] => {
  let data = JSON.parse(fs.readFileSync(filePath));

  let things: Thing[] = [];

  // Parse general configs

  // Parse IoT things definition
  data.things.forEach((obj: any) => {
    const context: string = '@context' in obj ? obj['@context'] : null;
    let type: string[] = null;
    if ('@type' in obj) {
      if (Array.isArray(obj['@type'])) {
        type = obj['@type'];
      } else {
        type = [obj['@type']];
      }
    }
    let t = new Thing(obj.name, obj.description, context, type);

    t.addProperties(obj.properties || []);
    t.addActions(obj.actions || []);
    t.addEvents(obj.events || []);
    t.addLinks(obj.links || []);

    things.push(t);
  });

  return things;
};

const readSpatialConfigs = (filePath: string): [] => {
  return []
};
