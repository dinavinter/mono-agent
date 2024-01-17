import { NodeFileStore } from "langchain/stores/file/node";
import {mkdtempSync} from "node:fs";

export class FileStore extends NodeFileStore {
    override lc_namespace = ["file_store"];
     public getBasePath(): string {
         console.log("getBasePath", super.basePath, this.basePath);
        return this.basePath;
    }

    constructor(basePath = mkdtempSync("langchain-")) {
         console.log("FileStore", basePath);
        super(basePath);
    }

   

   override  writeFile(path: string, contents: string): Promise<void> {
        try { 
           return  super.writeFile(path, contents);
    }catch(e) {
console.log("error", e);
        throw e;
    }
        }

}