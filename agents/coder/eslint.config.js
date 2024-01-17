const { FlatCompat } = require('@eslint/eslintrc');
const baseConfig = require('../../eslint.config.js');
const js = require('@eslint/js');
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});
module.exports = [
  ...baseConfig,
  {
    files: [
      'agents/coder/**/*.ts',
      'agents/coder/**/*.tsx',
      'agents/coder/**/*.js',
      'agents/coder/**/*.jsx',
    ],
    rules: {},
  },
  {
    files: ['agents/coder/**/*.ts', 'agents/coder/**/*.tsx'],
    rules: {},
  },
  {
    files: ['agents/coder/**/*.js', 'agents/coder/**/*.jsx'],
    rules: {},
  },
  ...compat.config({ parser: 'jsonc-eslint-parser' }).map((config) => ({
    ...config,
    files: ['agents/coder/**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        { ignoredFiles: ['{projectRoot}/vite.config.{js,ts,mjs,mts}'] },
      ],
    },
  })),
];
