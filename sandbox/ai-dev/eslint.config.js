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
      'libs/sendbox/**/*.ts',
      'libs/sendbox/**/*.tsx',
      'libs/sendbox/**/*.js',
      'libs/sendbox/**/*.jsx',
    ],
    rules: {},
  },
  {
    files: ['libs/sendbox/**/*.ts', 'libs/sendbox/**/*.tsx'],
    rules: {},
  },
  {
    files: ['libs/sendbox/**/*.js', 'libs/sendbox/**/*.jsx'],
    rules: {},
  },
  ...compat.config({ parser: 'jsonc-eslint-parser' }).map((config) => ({
    ...config,
    files: ['libs/sendbox/**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        { ignoredFiles: ['{projectRoot}/vite.config.{js,ts,mjs,mts}'] },
      ],
    },
  })),
];
