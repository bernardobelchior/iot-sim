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

  it("should throw when config proxy does not have both an `input` and at least one `output`", () => {
    expect(() =>
      Config.validateConfig({
        proxies: [
          {
            input: {
              href: "/things/thermometer",
              property: "/things/thermometer"
            }
          }
        ]
      })
    ).toThrow();

    expect(() =>
      Config.validateConfig({
        proxies: [
          {
            outputs: [
              {
                value: "2"
              }
            ]
          }
        ]
      })
    ).toThrow();
  });

  it("should throw when config with cron and href is passed", () => {
    expect(() =>
      Config.validateConfig({
        proxies: [
          {
            input: {
              cron: "* 0 0/5 14 * * ?",
              href: "/things/thermometer",
              property: "/things/thermometer"
            }
          }
        ]
      })
    ).toThrow();
  });

  it("should not throw when config with cron or href is passed", () => {
    expect(() =>
      Config.validateConfig({
        proxies: [
          {
            input: {
              cron: "* 0 0/5 14 * * ?"
            }
          }
        ]
      })
    ).not.toThrow();

    expect(() =>
      Config.validateConfig({
        proxies: [
          {
            input: {
              href: "/things/thermometer",
              property: "/things/thermometer"
            }
          }
        ]
      })
    ).not.toThrow();
  });

  it("should throw when config output has `value` and `expr`", () => {
    expect(() =>
      Config.validateConfig({
        proxies: [
          {
            output: {
              expr: "value * 2",
              value: 3
            }
          }
        ]
      })
    ).toThrow();
  });
});
