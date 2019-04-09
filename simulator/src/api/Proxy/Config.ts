import * as yup from "yup";
import * as math from "mathjs";

interface Input {
  href: string;
  property: string;
  suppress: boolean;
}

interface Output {
  value?: any;
  expr?: string;
  href?: string;
  property?: string;
  delay: number;
}

export interface IProxy {
  input: Input;
  outputs: Output[];
}

export interface IProxyConfig {
  proxies: IProxy[];
}

export class Config {
  proxies: IProxy[];

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
            href: yup.string().required(),
            property: yup.string().required(),
            suppress: yup.boolean().default(true)
          })
          .required(),
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
          .required()
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
