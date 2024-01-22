/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import tsconfigPaths from "vite-tsconfig-paths";
import * as path from 'path';

export default defineConfig({
  // root: __dirname,
  cacheDir: '../../node_modules/.vite/agents/browser',
  // optimizeDeps: {
  //   include: ['linked-dep'],
  // },
  
  
  plugins: [nxViteTsPaths(), tsconfigPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build:{
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      formats: ['es', "cjs", "umd"],
      fileName: 'index',
        
    }
  },
  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/agents/browser',
      provider: 'v8',
    },
  },
});
