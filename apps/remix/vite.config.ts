/// <reference types='vitest' />
import {defineConfig, UserConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {nxViteTsPaths} from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import {unstable_vitePlugin as remix} from "@remix-run/dev";
import {createWatchPaths} from '@nx/remix'
import { installGlobals } from "@remix-run/node";
import tsconfigPaths from "vite-tsconfig-paths";
import * as process from "process";
 installGlobals();
const watchPath = await createWatchPaths(__dirname)
const {default:tailwindcss} =await import('tailwindcss')
const {default:autoprefixer} =await import('autoprefixer')
console.log(watchPath);
console.log(process.cwd())
async function getConfig():Promise<UserConfig> {
    return {
        cacheDir: '../../node_modules/.vite/apps/remix',
        css: {
            postcss: {
                plugins: [
                    tailwindcss,
                    autoprefixer
                ]
            }
        },
        plugins: [tsconfigPaths(), remix({
            ignoredRouteFiles: ['**/.*'],

            // watchPaths: () => require('@nx/remix').createWatchPaths(__dirname),
              
             appDirectory: "app",
             assetsBuildDirectory: "build/client",
             publicPath: "/",
             serverBuildDirectory: "build/server",

            // browserNodeBuiltinsPolyfill: { modules: { path: true, fs:true,  "fs/promises": true, child_process: true , inspector: true ,readline: true, constants: true, http: true,  https: true, crypto: true   } },

        }), nxViteTsPaths()],

        // Uncomment this if you are using workers.
        // worker: {
        //  plugins: [ nxViteTsPaths() ],
        // },
        
        envPrefix: ['SRV_', 'PUBLIC_', 'VITE_'],
        envDir: '../..',
        server: {
            hmr: true,
            open: true,
            cors: true,
            fs: {
                // Allow serving files from one level up to the project root
                allow: ['../..'],

            }

            // "host": "local.pyzlo.in",
            // "https": {
            //     "key": "./.keys/local.pyzlo.in/privkey1.pem",
            //     "cert": "./.keys/local.pyzlo.in/fullchain1.pem"
            // }

        },


        test: {
            setupFiles: ['./test-setup.ts'],
            globals: true,
            cache: {
                dir: '../../node_modules/.vitest',
            },
            environment: 'jsdom',
            include: ['./tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

            reporters: ['default'],
            coverage: {
                reportsDirectory: '../../coverage/apps/remix',
                provider: 'v8',
            }
        },
    };
}

export default defineConfig( getConfig() );
