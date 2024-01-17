import { config } from "@swc/core/spack"
import * as process from "process";

module.exports = config({
    target: "node",
    mode: "development",
    
    entry: {
        web: __dirname + "/src/index.ts",
    },
    output: {
        name: "e2e",
        path: __dirname + "/src"
    },
    module: {
        
    },
    options:{
        module:{
            type: "commonjs"
        },
        isModule:true,
        cwd: `${process.cwd()}/agents/e2e`
        
        
    }
});