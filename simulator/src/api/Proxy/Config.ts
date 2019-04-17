import * as yup from "yup";
import * as math from "mathjs";
import { CronTime } from "cron";

interface Input {}

export interface ReplacerInput extends Input {
  href: string;
  property: string;
  suppress: boolean;
}

export interface GeneratorInput extends Input {
  cron: string;
}

interface Output {
  delay: number;
}

export interface GeneratorOutput extends Output {
  value: any;
  href: string;
  property: string;
}

export interface ReplacerOutput extends Output {
  value?: any;
  expr?: string;
  href?: string;
  property?: string;
}

interface IProxy<T extends Input, U extends Output> {
  input: T;
  outputs: U[];
}

export type Generator = IProxy<GeneratorInput, GeneratorOutput>;
export type Replacer = IProxy<ReplacerInput, ReplacerOutput>;

export interface IProxyConfig {
  generators: IProxy<GeneratorInput, GeneratorOutput>[];
  replacers: IProxy<ReplacerInput, ReplacerOutput>[];
}

export class Config {
  generators: Generator[];
  replacers: Replacer[];

  /**
   * @throws {ValidationError} if config is invalid
   * @throws {Error} if schema has async validation rules
   */
  constructor(config: unknown = {}) {
    /* Cast is safe since `validateConfig` throws if config is not valid. */
    const validConfig = Config.validateConfig(config) as IProxyConfig;

    this.replacers = validConfig.replacers;
    this.generators = validConfig.generators;
  }

  merge(config: Config) {
    this.replacers = [...this.replacers, ...config.replacers];
    this.generators = [...this.generators, ...config.generators];
  }

  /**
   * Validates config and may alter it (to add default values).
   * @throws {ValidationError} if config is invalid
   * @throws {Error} if schema has async validation rules
   * @return {IProxyConfig} (possibly) modified config
   */
  static validateConfig(config: unknown): IProxyConfig {
    return schema.validateSync(config, { stripUnknown: false }) as IProxyConfig;
  }
}

export const schema = yup
  .object()
  .shape({
    generators: yup
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
                )
            })
            .noUnknown(true)
            .required(),
          outputs: yup
            .array()
            .of(
              yup
                .object()
                .shape({
                  href: yup.string().required(),
                  property: yup.string().required(),
                  value: yup.mixed().required(),
                  delay: yup
                    .number()
                    .min(0)
                    .default(0)
                })
                .noUnknown(true)
            )
            .min(1)
            .required()
        })
      )
      .default([]),
    replacers: yup
      .array()
      .of(
        yup.object().shape({
          input: yup
            .object()
            .shape({
              href: yup.string().required(),
              property: yup.string().required(),
              suppress: yup.boolean().default(true)
            })
            .required()
            .noUnknown(true),
          outputs: yup
            .array()
            .of(
              yup
                .object()
                .shape({
                  value: yup.mixed(),
                  expr: yup.string(),
                  href: yup.string(),
                  property: yup.string(),
                  delay: yup
                    .number()
                    .min(0)
                    .default(0)
                })
                .noUnknown(true)
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
  })
  .noUnknown(true)
  .required();

/**
 * Tests if an output has value XOR expr defined and then validates the
 * existing one.
 */
function testValueOrExpression({ value, expr }: ReplacerOutput): boolean {
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
