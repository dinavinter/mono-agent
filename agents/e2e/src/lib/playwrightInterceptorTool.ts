import { StructuredTool, type ToolParams} from "langchain/tools";
import { z} from "zod";
 import fs from "fs";
import * as child_process from "node:child_process";
  
const playWrightToolSchema = z.object({
    test: z.string().describe("the test name or test's file path to run")


});


export class PlaywrightInterceptorTool extends StructuredTool<typeof playWrightToolSchema> {
    private readonly directory: string;

    constructor({directory, ...params}: { directory: string } & ToolParams) {
        super(params);
        console.log("playwright--constructor", {params});
        this.directory = directory;
        this.initPlaywright(directory);
    }

    private initPlaywright(directory: string) {
        if (!fs.existsSync(directory)) {
            try {
                console.log("creating directory", {directory});
                fs.mkdirSync(directory, {recursive: true});
                child_process.execSync(`pnpm create playwright`, {cwd: directory});
            } catch (e) {
                console.log("error creating directory", {directory, e});
                throw e;
            }
        }
        
    }

    static override lc_name() {
        return "Playwright";
    }

    name = "playwright_interpreter";

    description = `Playwright test runner`;

    schema = playWrightToolSchema;


      override async _call({test}: {
        test: string;
    }): Promise<string> {

        return new Promise<string>((resolve, reject) => {
            child_process.exec(`pnpx playwright test ${test}  --browser=chromium --reporter=json`, {cwd: this.directory}, (err, stdout, stderr) => {
                  resolve(JSON.stringify({
                      stdout,
                      stderr,
                      err
                  }));
             });


        })
    }
}


// static async imports(): Promise<{
//     chromium: typeof import("playwright").chromium;
//  }> {
//     try {
//         const { chromium } = await import("playwright");
//
//         return { chromium };
//     } catch (e) {
//         console.error(e);
//         throw new Error(
//             "Please install playwright as a dependency with, e.g. `yarn add playwright`"
//         );
//     }
// }

 