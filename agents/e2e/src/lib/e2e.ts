import {ReadFileTool, StructuredTool, WriteFileTool} from "langchain/tools";
import {FileStore} from "./fsStore";
import {HNSWLib} from "@langchain/community/vectorstores/hnswlib";
import type {VectorStore} from "langchain/vectorstores/base"
import {mkdtempSync} from "node:fs";
import * as fs from "fs";
import path from "path";
import {PlaywrightInterceptorTool} from "./playwrightInterceptorTool";
import {ChatOpenAI, OpenAI, OpenAIEmbeddings} from "@langchain/openai";
import {z} from "zod";
import {ChatPromptTemplate, PipelinePromptTemplate, PromptTemplate} from "@langchain/core/prompts";
import type {AgentStep, BaseMultiActionAgent, BaseSingleActionAgent} from "langchain/agents";
import {AgentExecutor, createReactAgent} from "langchain/agents";
import {type IterableReadableStreamInterface} from "@langchain/core/utils/stream";
import {type ChainValues} from "@langchain/core/utils/types";
import {Runnable} from "langchain/runnables";
import {BabyAGI} from "langchain/experimental/babyagi";
import {pull} from "langchain/hub";
import {htmlRetrieverTool} from "./htmlRetrieverTool";
import {AutoGPT} from "langchain/experimental/autogpt";
import {WebBrowser} from "langchain/tools/webbrowser";
import {BytesOutputParser} from "langchain/schema/output_parser";
import * as process from "process";
import {LLMChain} from "langchain/chains";


function initAgent() {
  
  const dir=path.resolve(process.cwd(), "build/session-");
  console.log(dir);

  const agentPath = mkdtempSync(dir);

  const sourceDir = path.resolve(process.cwd(), "build/e2e");
  fs.cpSync(sourceDir, agentPath, {recursive: true});

  // child_process.execSync(`pnpm create playwright`, {cwd: agentPath});
  
  return {
    agentPath,
    testsPath: path.resolve(agentPath, "tests"),
    testResultsPath: path.resolve(agentPath, "test-results"),
  };
}

export async function PlaywrightAutoGpt() {
  const tools = await testTools( );

  const vectorStore = new HNSWLib(new OpenAIEmbeddings(), {
    space: "cosine",
    numDimensions: 1536,
  }); 
  const agent = await babyAgent(vectorStore, tools);
  const outputParser = new BytesOutputParser();

  return AgentExecutor.fromAgentAndTools({
    agent: agent,
    tools,
    verbose:true

  });

 
}

///an open ai agent to write and execute cypress test using langchain with openai functions  
export async function tester():Promise<IterableReadableStreamInterface<ChainValues>>  {
 
  const agentExecutor = await PlaywrightAutoGpt();
  const responseSchema=z.object({
    directory: z.string().describe("the tests directory"),
    results: z.array(z.object({
      test: z.string().describe("the raw test"),
      result: z.string().describe("the test result")
    }))
  });
  const testZod= z.object({
    test: z.string().describe("the raw test"),
    result: z.string().describe("the test result")
  })

  type TestResult= {
    test: string;
    result: string;
  };
  return  agentExecutor 
      .stream({input:'test register and login at https://login.gigen.zon.cx/pages/login'}, {recursionLimit: 10  });

}
type Agent=BaseSingleActionAgent |
    BaseMultiActionAgent |
    Runnable<ChainValues & { steps?: AgentStep[];}>
async function babyAgent(vectorStore: VectorStore, tools: StructuredTool[] ):Promise<Agent> {

 
  const llm = new OpenAI({
    temperature: 0,
  });



  const executionChain = new AgentExecutor({
    agent: await createReactAgent({
      llm,
      tools,
      prompt: new PipelinePromptTemplate({
        pipelinePrompts: [
          {
            name: "react",
            prompt: await pull<PromptTemplate>("hwchase17/react"),
          }],
        finalPrompt: PromptTemplate.fromTemplate(`
                You are an AI who performs one task based on the following objective: {objective}. 
                Take into account these previously completed tasks: {context}.
                {react}
                {instructions}
                Question: {task}`),
      }),
    }),
    tools
  });
  
  const  overall_instructions= `
             Your task is to understand and interpret test requirements in the question, write playwright tests efficiently,
            save the tests in the root directory with the .spec.ts extension, and execute these tests accordingly. 
             in order to understand the test flow you need to browse to the website and try different links and forms, eventually come up with a plan of you are about to test and it fulfill the task requirements.
             If a component is a form, try to interact with the form. 
             If the component includes links, then try to interact with the links.
             then generate the test in playwright format and save it in the root directory with the .spec.ts extension, and execute these tests accordingly.
            Include a short name of the component in a few words in the response wrapped in "$$" characters, use snake case format inside of test with a JavaScript comment. 
            Remember to make sure to save the tests with a new file spec and then pass them to an the test execute tool.
             if the test  try to fix it and try again.
                `;
    
  const creationChain = new LLMChain({
    llm,
    prompt: new PromptTemplate({
      template: `You are an task creation AI that uses the result of an execution agent 
        to create new tasks with the following objective: {objective} 
        The last completed task has the result: {result} 
        This result was based on this task description: {task_description} 
        These are incomplete tasks: {incomplete_tasks} 
        Based on the result, create new tasks to be completed 
        by the AI system that do not overlap with incomplete tasks 
        Return the tasks as an array.
       ${overall_instructions}`,
      inputVariables: [
        "result",
        "task_description",
        "incomplete_tasks",
        "objective",
      ],
    })
  }) 

  return BabyAGI.fromLLM(
      {
        llm: new ChatOpenAI({temperature: 0.7}),
        vectorstore: vectorStore,
        maxIterations: 10,
        executionChain: executionChain,
        creationChain: creationChain
      }
  );
    















  // return await createReactAgent({
  //        llm: new ChatOpenAI({ temperature: 0.5, modelName: MODEL }),
  //        tools: tools,
  //        prompt: prompt 
  //    
  //    });
  //store vector
  // const vectorDest = path.resolve(store.getBasePath() , "vectorstore");
  // await vectorStore.save(path.resolve(store.getBasePath() , vectorDest));
  // console.log("result", vectorDest);


}


export async function testTools(): Promise<StructuredTool[]>{
  const {agentPath, testsPath, testResultsPath} = initAgent();
  const store = new FileStore(testsPath);
  
  

  return [
    new WriteFileTool({store: store , metadata: {extension: ".spec.ts" , directory: testsPath , name: "test-write" , description: "save the test so you can run it with interceptor tool" }}),
    new ReadFileTool({store: store, metadata: {extension: ".spec.ts" , directory: testsPath , name: "test-read" , description: "read a test file" }}),
    new ReadFileTool({store: new FileStore(testResultsPath) , metadata: {extension: ".json" , directory: testsPath , name: "read-test-result" ,  description: "read a test result file" }}),

    // TestTool,
    await htmlRetrieverTool(),
    new WebBrowser({
    model: new ChatOpenAI({ temperature: 0 }),
    embeddings: new OpenAIEmbeddings({}),
  }),
    new PlaywrightInterceptorTool({directory:  agentPath}),

  ]



}

export async function ChatGenerator({message}: {message: string}){
  const chat =new ChatOpenAI({temperature: 0.7, verbose:true});
  const prompt =  ChatPromptTemplate.fromTemplate(`Generate a chat name to the following message: {message}`);
  const chat_name = prompt.pipe(chat).invoke({message});
}
  
export async function AutoGPTTester() {
   const tools = await testTools();

  const vectorStore = new HNSWLib(new OpenAIEmbeddings(), {
    space: "cosine",
    numDimensions: 1536,
  });
  
   return   AutoGPT.fromLLMAndTools(
      new ChatOpenAI({temperature: 0.7, verbose:true}),
      [...tools ],
      {
        memory: vectorStore.asRetriever(),
        aiName: "Tom",
        aiRole: "Assistant",
        maxIterations: 30  
          
      });
}
