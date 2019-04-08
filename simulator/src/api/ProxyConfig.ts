import * as yup from "yup";

interface Input {
  href: string;
  property: string;
  suppress: boolean;
}

interface Output {
  value: unknown;
  href?: string;
  delay: number;
}

export interface IProxy {
  input: Input;
  outputs: Output[];
}

interface IProxyConfig {
  proxies: IProxy[];
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
            suppress: yup.boolean().default(true)
          })
          .required(),
        outputs: yup
          .array()
          .of(
            yup.object().shape({
              value: yup.mixed().required(),
              href: yup.string(),
              delay: yup
                .number()
                .min(0)
                .default(0)
            })
          )
          .required()
      })
    )
    .default([])
});

export class ProxyConfig {
  proxies: IProxy[];

  /**
   * @throws {ValidationError} if config is invalid
   * @throws {Error} if schema has async validation rules
   */
  constructor(config: unknown = {}) {
    /* Cast is safe since `validateConfig` throws if config is not valid. */
    const validConfig = ProxyConfig.validateConfig(config) as IProxyConfig;

    this.proxies = validConfig.proxies;
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
