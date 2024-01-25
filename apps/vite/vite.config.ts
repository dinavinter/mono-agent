import { unstable_vitePlugin as remix } from "@remix-run/dev";
import {defineConfig, UserConfig} from 'vite';
import tsconfigPaths from "vite-tsconfig-paths";
import {nxViteTsPaths} from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { installGlobals } from "@remix-run/node";
// import { cjsInterop } from "vite-plugin-cjs-interop";
import { visualizer } from "rollup-plugin-visualizer";
// import {createWatchPaths} from '@nx/remix';
import topLevelAwait from "vite-plugin-top-level-await";
import dts from "vite-plugin-dts";


installGlobals();

async function getConfig():Promise<UserConfig> {
  // const process =await import('process');
  //const cjsInterop =await import('vite-plugin-cjs-interop');
  const tailwindcss =await import('tailwindcss')
  const autoprefixer =await import('autoprefixer')
  // const watchPath = await createWatchPaths(__dirname)
  // console.log(watchPath);
  // console.log(process.cwd())
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
    //   external: ['@mono-agent/tester'],
    //   target:'node'
    // }
    

    plugins: [tsconfigPaths(),
      // cjsInterop({
      // dependencies: [
      //   '@mono-agent/tester'
      //
      // ]}),
      remix({
        ignoredRouteFiles: ['**/.*'],

        // watchPaths: () => require('@nx/remix').createWatchPaths(__dirname),

        appDirectory: 'app',
        assetsBuildDirectory: 'build/client',
        publicPath: '/',
        serverBuildDirectory: 'build/server',

        // watchPaths: () => require('@nx/remix').createWatchPaths(__dirname),
        // appDirectory: `app`,
        //
        // assetsBuildDirectory: `${process.cwd()}/dist/apps/vite/client`,
        // publicPath: `${process.cwd()}/dist/apps/vite/public`,
        // serverBuildDirectory: `${process.cwd()}/dist/apps/vite/server`,
        // unstable_ssr:true
        // browserNodeBuiltinsPolyfill: { modules: { path: true, fs:true,  "fs/promises": true, child_process: true , inspector: true ,readline: true, constants: true, http: true,  https: true, crypto: true   } },

      }), 
      nxViteTsPaths(),
      visualizer({ emitFile: true }),
      topLevelAwait(),
      dts({
        entryRoot: 'src',
      })
 
    ],
  };
}

export default defineConfig(getConfig());
