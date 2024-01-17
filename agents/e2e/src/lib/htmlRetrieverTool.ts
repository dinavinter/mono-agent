import {DynamicStructuredTool} from "langchain/tools";
import {z} from "zod";
import  {PlaywrightWebBaseLoader} from "langchain/document_loaders/web/playwright"
export function PlaywrightWebBaseLoaderTool() {
     return new DynamicStructuredTool({
        name: "html-retriever",
        schema: z.object({
            url: z.string().url(),
        }),
        async func({url}: { url: string }) {
            const loader = new PlaywrightWebBaseLoader(url);
            const document = await loader.load();

            return JSON.stringify(document);
        },
        description: "retrieves html from a url",
    });
}
export async function htmlRetrieverTool() {
    const {PlaywrightWebBaseLoader} = await import("langchain/document_loaders/web/playwright");
    return new DynamicStructuredTool({
        name: "html-retriever",
        schema: z.object({
            url: z.string().url(),
        }),
        async func({url}: { url: string }) {
            const loader = new PlaywrightWebBaseLoader(url);
            const document = await loader.load();
            
            return JSON.stringify(document);
        },
        description: "retrieves html from a url",
    });
}