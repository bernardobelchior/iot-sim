import { parseWebThing } from "../builder";
import { SimulatedThing } from "./SimulatedThing";

const thing = {
  name: "Lamp",
  description: "A web connected lamp",
  properties: {
    on: {
      title: "On/Off",
      type: "boolean",
      description: "Whether the lamp is turned on",
      links: [{ href: "/things/lamp/properties/on" }]
    }
  },
  href: "/things/lamp"
};

describe("SimulatedThing", () => {
  it("should return true when isSimulated is called", async () => {
    const simulatedThing = new SimulatedThing(parseWebThing(thing));

    expect(simulatedThing.isSimulated()).toBeTruthy();
  });
});
