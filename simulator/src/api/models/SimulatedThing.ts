import { Thing } from "./Thing";

export class SimulatedThing extends Thing {
  constructor(thing: Thing) {
    super(
      thing.name,
      thing.description,
      thing.href,
      thing.context,
      SimulatedThing.makeSimulated(thing.type)
    );
  }

  static fromDescription(desc: any) {
    const thing = Thing.fromDescription(desc);
    return new this(thing);
  }

  private static makeSimulated(type: string[]) {
    if (type.includes("Simulated")) {
      return type;
    } else {
      return [...type, "Simulated"];
    }
  }
}
