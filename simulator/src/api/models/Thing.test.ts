import { Thing } from "./Thing";

describe("Thing.isSimulated()", () => {
  it("should return true if thing has 'Simulated' in '@type'", function() {
    const thing = new Thing("Lamp", "Test", "/1", undefined, ["Simulated"]);

    expect(thing.isSimulated()).toBeTruthy();
  });
});
