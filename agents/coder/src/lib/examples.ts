import { Document } from "langchain/document";
import {examples} from "nx/src/command-line/examples";
import { BaseCallbackConfig } from "langchain/callbacks";
import {
    collapseDocs,
    splitListOfDocs,
} from "langchain/chains/combine_documents/reduce";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";
import { formatDocument } from "langchain/schema/prompt_template";
import {
    RunnablePassthrough,
    RunnableSequence,
} from "langchain/schema/runnable";


type ExampleDoc = {
    title: string;
    content: string;
    metadata?: Record<string, any>;
}| string

export async function exampleLoader(examples:ExampleDoc[] | string[]){
    function doc(example:ExampleDoc) {
        return new Document({ pageContent: typeof example === 'string' ? example : example.content});
    }
     
    const docs= examples.map(doc);
    const result = await mapReduceChain.invoke(docs);
    return result;    
}


// Initialize the OpenAI model
const model = new ChatOpenAI({});

// Define prompt templates for document formatting, summarizing, collapsing, and combining
const documentPrompt = PromptTemplate.fromTemplate("{pageContent}");
const summarizePrompt = PromptTemplate.fromTemplate(
    "Summarize this content:\n\n{context}"
);
const collapsePrompt = PromptTemplate.fromTemplate(
    "Collapse this content:\n\n{context}"
);
const combinePrompt = PromptTemplate.fromTemplate(
    "Combine these summaries:\n\n{context}"
);

// Wrap the `formatDocument` util so it can format a list of documents
const formatDocs = async (documents: Document[]): Promise<string> => {
    const formattedDocs = await Promise.all(
        documents.map((doc) => formatDocument(doc, documentPrompt))
    );
    return formattedDocs.join("\n\n");
};

// Define a function to get the number of tokens in a list of documents
const getNumTokens = async (documents: Document[]): Promise<number> =>
    model.getNumTokens(await formatDocs(documents));

// Initialize the output parser
const outputParser = new StringOutputParser();

// Define the map chain to format, summarize, and parse the document
const mapChain = RunnableSequence.from([
    { context: async (i: Document) => formatDocument(i, documentPrompt) },
    summarizePrompt,
    model,
    outputParser,
]);

// Define the collapse chain to format, collapse, and parse a list of documents
const collapseChain = RunnableSequence.from([
    { context: async (documents: Document[]) => formatDocs(documents) },
    collapsePrompt,
    model,
    outputParser,
]);

// Define a function to collapse a list of documents until the total number of tokens is within the limit
const collapse = async (
    documents: Document[],
    config?: BaseCallbackConfig,
    tokenMax = 4000
) => {
    const editableConfig = config;
    let docs = documents;
    let collapseCount = 1;
    while ((await getNumTokens(docs)) > tokenMax) {
        if (editableConfig) {
            editableConfig.runName = `Collapse ${collapseCount}`;
        }
        const splitDocs = splitListOfDocs(docs, getNumTokens, tokenMax);
        docs = await Promise.all(
            splitDocs.map((doc) => collapseDocs(doc, collapseChain.invoke))
        );
        collapseCount += 1;
    }
    return docs;
};

// Define the reduce chain to format, combine, and parse a list of documents
const reduceChain = RunnableSequence.from([
    { context: formatDocs },
    combinePrompt,
    model,
    outputParser,
]).withConfig({ runName: "Reduce" });

// Define the final map-reduce chain
const mapReduceChain = RunnableSequence.from([
    RunnableSequence.from([
        { doc: new RunnablePassthrough(), content: mapChain },
        (input) =>
            new Document({
                pageContent: input.content,
                metadata: input.doc.metadata,
            }),
    ])
        .withConfig({ runName: "Summarize (return doc)" })
        .map(),
    collapse,
    reduceChain,
]).withConfig({ runName: "Map reduce" });
