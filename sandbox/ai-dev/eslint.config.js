import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import baseConfig from '../../eslint.config.js';

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});
export default [
  ...baseConfig,
  {
    files: [
      'libs/sandbox/**/*.ts',
      'libs/sandbox/**/*.tsx',
      'libs/sandbox/**/*.js',
      'libs/sandbox/**/*.jsx',
    ],
    rules: {},
  },
  {
    files: ['libs/sandbox/**/*.ts', 'libs/sandbox/**/*.tsx'],
    rules: {},
  },
  {
    files: ['libs/sandbox/**/*.js', 'libs/sandbox/**/*.jsx'],
    rules: {},
  },
  ...compat.config({ parser: 'jsonc-eslint-parser' }).map((config) => ({
    ...config,
    files: ['libs/sandbox/**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        { ignoredFiles: ['{projectRoot}/vite.config.{js,ts,mjs,mts}'] },
      ],
    },
  })),
];
