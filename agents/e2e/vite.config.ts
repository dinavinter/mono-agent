/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/agents/e2e',

  plugins: [nxViteTsPaths(), tsconfigPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/agents/e2e',
      provider: 'v8',
    },
  },
});
