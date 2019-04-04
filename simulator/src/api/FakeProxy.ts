import * as yup from 'yup';

export const schema = yup.object().shape({
    proxies: yup.array().of(yup.object().shape({
        input: yup.object().shape({
            href: yup.string().required(),
            suppress: yup.boolean().default(true),
        }).required(),
        outputs: yup.array().of(yup.object().shape({
            value: yup.mixed().required(),
            href: yup.string(),
            delay: yup.number().min(0).default(0)
        })).required(),
    })).required()
})

interface Input {
            href: string;
            suppress: boolean;
}

interface Output {
            value: unknown;
            href?: string;
            delay: number;
}

interface Proxy {
        input: Input,
        outputs: Output[]
}

interface ProxyConfig {
    proxies: Proxy[]
}

export function validateProxyConfig(config: unknown): config is ProxyConfig {
    try {
        schema.validateSync(config);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}


export class FakeProxy {
    config: ProxyConfig;

    constructor(config: ProxyConfig) {
        this.config = config;
    }
}