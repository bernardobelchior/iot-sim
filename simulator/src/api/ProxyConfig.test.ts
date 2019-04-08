import { ProxyConfig } from "./ProxyConfig";
import fs from "fs";
import * as toml from "toml";

describe("ProxyConfig", () => {
  it("should parse `simpleReplacer.toml` configuration", () => {
    const result = toml.parse(
      fs.readFileSync("./examples/configs/simpleReplacer.toml").toString()
    );

    expect(() => {
      new ProxyConfig(result);
    }).not.toThrow();
  });
});
