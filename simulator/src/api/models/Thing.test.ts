import { Thing } from "./Thing";

describe("Thing", () => {
  it(".isSimulated() returns true if thing has 'Simulated' in '@type'", function() {
    const thing = new Thing("Lamp", "Test", undefined, ["Simulated"]);

    expect(thing.isSimulated()).toBeTruthy();
  });
});
