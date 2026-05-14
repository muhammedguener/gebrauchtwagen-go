// https://oxc.rs/docs/guide/usage/formatter/config.html
// https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html

import { defineConfig } from 'oxfmt';

export default defineConfig({
    sortPackageJson: false,
    singleQuote: true,
    trailingComma: 'all',
    overrides: [
        {
            files: ['*.toml', '*.yml', '*.yaml'],
            options: {
                singleQuote: false,
            },
        },
    ],
    ignorePatterns: [
        '*.md',
        'src/config/resources/postgresql/*.sql',
        'src/config/resources/tls/*.crt',
        'src/config/resources/tls/*.pem',
    ],
});
