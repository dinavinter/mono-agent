const { FlatCompat } = require('@eslint/eslintrc');
const baseConfig = require('../eslint.config.js');
const js = require('@eslint/js');
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});
module.exports = [
  ...baseConfig,
  {
    files: [
      'agents/task-analyze/**/*.ts',
      'agents/task-analyze/**/*.tsx',
      'agents/task-analyze/**/*.js',
      'agents/task-analyze/**/*.jsx',
    ],
    rules: {},
  },
  {
    files: ['agents/task-analyze/**/*.ts', 'agents/task-analyze/**/*.tsx'],
    rules: {},
  },
  {
    files: ['agents/task-analyze/**/*.js', 'agents/task-analyze/**/*.jsx'],
    rules: {},
  },
  ...compat.config({ parser: 'jsonc-eslint-parser' }).map((config) => ({
    ...config,
    files: ['agents/task-analyze/**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        { ignoredFiles: ['{projectRoot}/vite.config.{js,ts,mjs,mts}'] },
      ],
    },
  })),
];
