import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import {nxViteTsPaths} from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { installGlobals } from "@remix-run/node";
// import { cjsInterop } from "vite-plugin-cjs-interop";

installGlobals();

async function getConfig() {
  const tailwindcss =await import('tailwindcss')
  const autoprefixer =await import('autoprefixer')

  return {

    cacheDir: '../../node_modules/.vite/apps/vite',
    // css: {
    //   postcss: {
    //     plugins: [
    //       tailwindcss,
    //       autoprefixer,
    //     ],
    //   },
    // },
    resolve: {
      dedupe: ['react', 'react-dom', 'xstate'],
    },
    // build:{
    //   commonjsOptions: {
    //     include: [/linked-dep/, /node_modules/],
    //   },
    //
    // },
    // optimizeDeps: {
    //   force:true,
    //   include: ['linked-dep'], 
    //    needsInterop: ['@mono-agent/browser']
    // },
    // ssr:{
    //   external: ['@mono-agent/browser'],
    //   target:'node'
    // },

    plugins: [tsconfigPaths(),
      // cjsInterop({
      // // List of CJS dependencies that require interop
      // dependencies: [
      //   '@mono-agent/browser',
      //   '@mono-agent/browser/*',
      //
      // ]}),
      remix({
        ignoredRouteFiles: ['**/.*'],

        // watchPaths: () => require('@nx/remix').createWatchPaths(__dirname),

        appDirectory: 'app',
        assetsBuildDirectory: 'build/client',
        publicPath: '/',
        serverBuildDirectory: 'build/server',

        // browserNodeBuiltinsPolyfill: { modules: { path: true, fs:true,  "fs/promises": true, child_process: true , inspector: true ,readline: true, constants: true, http: true,  https: true, crypto: true   } },

      }), nxViteTsPaths()],
  };
}

export default defineConfig(getConfig());
