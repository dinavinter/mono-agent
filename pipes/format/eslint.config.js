import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import baseConfig from '../../eslint.config.js';
import {__dirname} from 'typing';
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});
export default  [
  ...baseConfig,
  {
    files: [
      'pipes/format/**/*.ts',
      'pipes/format/**/*.tsx',
      'pipes/format/**/*.js',
      'pipes/format/**/*.jsx',
    ],
    rules: {},
  },
  {
    files: ['pipes/format/**/*.ts', 'pipes/format/**/*.tsx'],
    rules: {},
  },
  {
    files: ['pipes/format/**/*.js', 'pipes/format/**/*.jsx'],
    rules: {},
  },
  ...compat.config({ parser: 'jsonc-eslint-parser' }).map((config) => ({
    ...config,
    files: ['pipes/format/**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        { ignoredFiles: ['{projectRoot}/vite.config.{js,ts,mjs,mts}'] },
      ],
    },
  })),
];
