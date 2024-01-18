/// <reference types='vitest' />
import { defineConfig } from 'vite';

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import fs from 'fs';
import tsconfigPaths from "vite-tsconfig-paths";


export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/agents/browser',
  optimizeDeps: {
    include: ['linked-dep'],
  },
  plugins: [nxViteTsPaths(), tsconfigPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build:{
    minify:false,
    lib: {
      entry: '/src/index.js',
      formats: ['cjs'],
      fileName: 'index',
    },
    
    manifest: true,
    outDir: '../../dist/agents/browser',
    emptyOutDir: true,
    sourcemap: true,
    target: 'node',
    
    write: true,
    rollupOptions: {
      // overwrite default .html entry
      input: '/src/index.js',
      
    },
    commonjsOptions: {
      include: [/linked-dep/, /node_modules/],
    },

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
