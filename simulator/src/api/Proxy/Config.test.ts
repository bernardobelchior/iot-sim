import { Config } from "./Config";
import fs from "fs";
import * as toml from "toml";

describe("Config", () => {
  it("should parse `simpleReplacer.toml` configuration", () => {
    const result = toml.parse(
      fs.readFileSync("./examples/configs/simpleReplacer.toml").toString()
    );

    expect(() => {
      new Config(result);
    }).not.toThrow();
  });

  it("should parse an empty config as valid", () => {
    expect(() => Config.validateConfig({})).not.toThrow();

    expect(new Config({}).proxies).toEqual([]);
  });
});
