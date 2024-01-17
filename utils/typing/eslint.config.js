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
      'utils/typing/**/*.ts',
      'utils/typing/**/*.tsx',
      'utils/typing/**/*.js',
      'utils/typing/**/*.jsx',
    ],
    rules: {},
  },
  {
    files: ['utils/typing/**/*.ts', 'utils/typing/**/*.tsx'],
    rules: {},
  },
  {
    files: ['utils/typing/**/*.js', 'utils/typing/**/*.jsx'],
    rules: {},
  },
  ...compat.config({ parser: 'jsonc-eslint-parser' }).map((config) => ({
    ...config,
    files: ['utils/typing/**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        { ignoredFiles: ['{projectRoot}/vite.config.{js,ts,mjs,mts}'] },
      ],
    },
  })),
];
