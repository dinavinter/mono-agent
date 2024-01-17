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
      'tools/types/**/*.ts',
      'tools/types/**/*.tsx',
      'tools/types/**/*.js',
      'tools/types/**/*.jsx',
    ],
    rules: {},
  },
  {
    files: ['tools/types/**/*.ts', 'tools/types/**/*.tsx'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
  {
    files: ['tools/types/**/*.js', 'tools/types/**/*.jsx'],
    rules: {},
  },
  ...compat.config({ parser: 'jsonc-eslint-parser' }).map((config) => ({
    ...config,
    files: ['tools/types/**/*.json'],
    rules: { '@nx/dependency-checks': 'error' },
  })),
];
