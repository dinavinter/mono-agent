import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import baseConfig from '../../eslint.config.js';

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});
export default [
  ...baseConfig,
  {
    files: [
      'tools/text-split/**/*.ts',
      'tools/text-split/**/*.tsx',
      'tools/text-split/**/*.js',
      'tools/text-split/**/*.jsx',
    ],
    rules: {},
  },
  {
    files: ['tools/text-split/**/*.ts', 'tools/text-split/**/*.tsx'],
    rules: {},
  },
  {
    files: ['tools/text-split/**/*.js', 'tools/text-split/**/*.jsx'],
    rules: {},
  },
  ...compat.config({ parser: 'jsonc-eslint-parser' }).map((config) => ({
    ...config,
    files: ['tools/text-split/**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        { ignoredFiles: ['{projectRoot}/vite.config.{js,ts,mjs,mts}'] },
      ],
    },
  })),
];
