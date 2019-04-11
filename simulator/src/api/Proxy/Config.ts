import * as yup from "yup";
import * as math from "mathjs";
import { CronTime } from "cron";

export interface ReplacerInput {
  href: string;
  property: string;
  suppress: boolean;
}

export interface GeneratorInput {
  cron: string;
}

export type Input = GeneratorInput | ReplacerInput;

interface Output {
  value?: any;
  expr?: string;
  href?: string;
  property?: string;
  delay: number;
}

export interface IProxy<T extends Input> {
  input: T;
  outputs: Output[];
}

export interface IProxyConfig {
  proxies: IProxy<any>[];
}

export class Config {
  proxies: IProxy<any>[];

  /**
   * @throws {ValidationError} if config is invalid
   * @throws {Error} if schema has async validation rules
   */
  constructor(config: unknown = {}) {
    /* Cast is safe since `validateConfig` throws if config is not valid. */
    const validConfig = Config.validateConfig(config) as IProxyConfig;

    this.proxies = validConfig.proxies;
  }

  merge(config: Config) {
    this.proxies = [...this.proxies, ...config.proxies];
  }

  /**
   * Validates config and may alter it (to add default values).
   * @throws {ValidationError} if config is invalid
   * @throws {Error} if schema has async validation rules
   * @return {IProxyConfig} (possibly) modified config
   */
  static validateConfig(config: unknown): IProxyConfig {
    return schema.validateSync(config) as IProxyConfig;
  }
}

export const schema = yup.object().shape({
  proxies: yup
    .array()
    .of(
      yup.object().shape({
        input: yup
          .object()
          .shape({
            cron: yup
              .string()
              .test(
                "parse-cron",
                "Cron expression is not valid",
                testCronExpression
              ),
            href: yup.string(),
            property: yup.string(),
            suppress: yup.boolean().default(true)
          })
          .required()
          .test(
            "generator-or-replacer",
            "Generator and Replacer properties are mutually exclusive. Use either `cron` or `property`, `href` and `suppress`",
            testReplacerOrGenerator
          ),
        outputs: yup
          .array()
          .of(
            yup
              .object()
              .shape({
                href: yup.string(),
                delay: yup
                  .number()
                  .min(0)
                  .default(0)
              })
              .test(
                "value-or-expr",
                "An output can only have a value OR an expression; not both nor neither.",
                testValueOrExpression
              )
          )
          .default([])
      })
    )
    .default([])
});

/**
 * Tests if an output has value XOR expr defined and then validates the
 * existing one.
 */
function testValueOrExpression({ value, expr }: Output): boolean {
  /* value === undefined XOR expr === undefined */
  if (
    (value === undefined && expr === undefined) ||
    (value !== undefined && expr !== undefined)
  ) {
    return false;
  }

  if (value !== undefined) {
    return true;
  }

  if (expr !== undefined) {
    return (
      yup
        .string()
        .required()
        .isValidSync(expr) && isExpressionValid(expr)
    );
  }

  throw new Error("Unreachable");
}

/**
 * Validates mathjs expression.
 */
function isExpressionValid(expression: string): boolean {
  try {
    math.eval(expression, { value: NaN });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Makes sure the Input is either a generator (only has cron property)
 * or a replacer (has the other 2). They are mutually exclusive.
 */
function testReplacerOrGenerator(input: Input): boolean {
  const { cron, href, property, suppress } = input as any;

  if (cron) {
    return href === undefined && property === undefined;
  }

  return yup
    .object()
    .shape({
      href: yup.string().required(),
      property: yup.string().required(),
      suppress: yup.boolean().required()
    })
    .isValidSync({ href, property, suppress });
}

/**
 * Tries to parse the cron expression.
 * @param cron
 */
function testCronExpression(cron: string): boolean {
  try {
    new CronTime(cron);
    return true;
  } catch (e) {
    return false;
  }
}
