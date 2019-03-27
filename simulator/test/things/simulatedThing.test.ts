import { SimulatedThing } from "../../src/api/models/SimulatedThing";

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
  id: "lamp"
};

describe("SimulatedThing", () => {
  it("should return true when isSimulated is called", async () => {
    const simulatedThing = SimulatedThing.fromDescription(thing);

    expect(simulatedThing.isSimulated()).toBeTruthy();
  });
});
