import { validateProxyConfig } from '../src/api/FakeProxy';
import toml from 'toml';
import fs from 'fs';

describe('FakeProxy', () => {
    it('should parse TOML correctly', () => {
        const result = toml.parse(fs.readFileSync('./test/example.toml').toString())
        expect(validateProxyConfig(result)).toBeTruthy();
    })
})