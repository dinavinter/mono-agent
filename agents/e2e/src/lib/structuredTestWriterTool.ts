import {ChainTool, DynamicStructuredTool, Tool} from "langchain/tools";
import {z} from "zod";
import {pull} from "langchain/hub";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {AgentExecutor, createOpenAIToolsAgent, Toolkit} from "langchain/agents";
import {ChatOpenAI, OpenAI, OpenAIEmbeddings} from "@langchain/openai";
import {createOpenAIFnRunnable} from "langchain/chains/openai_functions";
import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import {EntityMemory} from "langchain/memory";
import {LLMChain} from "langchain/chains";
import { PlaywrightWebBaseLoaderTool} from "./htmlRetrieverTool";
import {ToolInterface} from "@langchain/core/tools";
import {WebBrowser} from "langchain/tools/webbrowser";


  class TesterToolkit extends Toolkit {
    tools : ToolInterface[]

    constructor() {
        super();
        this.memory = new EntityMemory({
            llm: new OpenAI({temperature: 0}),
            chatHistoryKey: "history",
            entitiesKey: "tests",
        });
        const browser = new WebBrowser({
                   model: new ChatOpenAI({ temperature: 0 }),
            embeddings: new OpenAIEmbeddings({}),
         });
        this.tools = [
            TesterToolkit.TestWriterChainTool(this),
            TesterToolkit.TestFixerChainTool(this),
            // TesterToolkit.TestComponentChainTool(this),
            //  PlaywrightWebBaseLoaderTool(),
            browser
        ];
    }
    memory = new EntityMemory({
        llm: new OpenAI({temperature: 0}),
        chatHistoryKey: "history", // Default value
        entitiesKey: "tests", // Default value
    });

    static fromMemory(memory?: EntityMemory){
        return memory && 
            `Context:
        {${memory.entitiesKey}
        
        Current conversation:
        {${memory.chatHistoryKey}}
         `
    }
    static TestWriterChainTool ({memory}: {memory?:EntityMemory}) {

        return new ChainTool({
            name: "test_writer",
            description: "Generates PlayWright test for a given flow in a given HTML page hosted at a URL",
            chain: new LLMChain({
                llm: new OpenAI({temperature: 0.7}),
                prompt: ChatPromptTemplate.fromTemplate(
                    `Your task is to create a passing test case for the following flow. Please do not add any additional text in the response, just return the code!, 
                Your task is to generate comprehensive a PlayWright test file for the following {flow}, make sure to navigate to the provided url in the test.
                Here is the HTML for a website hosted at {url}, """{html}""""
                ${this.fromMemory(memory)}
         `),
                memory: memory
            })
        })
    }

    static TestFixerChainTool ({memory}: {memory?:EntityMemory})
    {
        return new ChainTool({
            name: "test_fixer",
            description: "Fixes a PlayWright test",
            chain: new LLMChain({
                llm: new OpenAI({temperature: 0.7}),
                prompt: ChatPromptTemplate.fromTemplate(`
        I got an error running the test, please try to fix the code to make the test pass. You likely need to update the assertions to match the expected and please output all of the code for the test file fixed, so I copy it and run it. Don't forget to include PlayWright with "import { test, expect } from '@playwright/test' 
        {error}
        ${this.fromMemory(memory)}
         `),
                memory: memory
            })
        })
    }

    static TestComponentChainTool  ({memory}: {memory?:EntityMemory}) {
        return new ChainTool({
            name: "test_component",
            description: "Generates more components of PlayWright tests for a given HTML page hosted at a URL",
            chain: new LLMChain({
                llm: new OpenAI({temperature: 0.7}),
                prompt: ChatPromptTemplate.fromTemplate(`
        This is great, let us proceed with an interactive test with several assertions for component that you have not generated a test for already. For example, components could be the navigation bar, the search bar, footer links, the login form. Include a short name of the component in a few words in the response wrapped in "$$" characters, use snake case format inside of test with a JavaScript comment.
        ${this.fromMemory(memory)}
         `),
                memory: memory
            })
        })
    }
}


export const StructuredTestWriterTool =  
     
     
      new DynamicStructuredTool({
        name: "test_writer",
        description: "Generates PlayWright tests for a given HTML page hosted at a URL",
        schema: z.object({
            task: z.string()
                .describe('the objective to test or the test to fix'),
            url: z.string()
                .describe('where the web site is hosted'),
            html: z.string()
                .describe('web site html content')
        }),


        async func({task, html, url}) {
            const prompt = await pull<ChatPromptTemplate>(
                "hwchase17/openai-tools-agent"
            );
            const runnable = await createOpenAIToolsAgent(
                {
                    prompt: prompt,
                    llm: new ChatOpenAI({temperature: 0.7, modelName: "gpt-4-32k"}),
                    tools: new TesterToolkit().tools
                }
            )
            const outputChain = createOpenAIFnRunnable({
                llm: new ChatOpenAI({temperature: 0.7, modelName: "gpt-4-32k"}),
                prompt: ChatPromptTemplate.fromMessages([
                    ["ai", "Test is: {test}"],
                ]),
                functions: [
                    {
                        name: "save_test",
                        description: "save test to file",
                        parameters: {
                            properties: {
                                name: {
                                    type: "string"
                                },
                                code: {
                                    type: "string"
                                },
                                file_name: {
                                    type: "string"
                                }
                            }
                        }
                    }
                ]

            })
            const agentExecutor = new AgentExecutor({
                agent: runnable,
                tools:  new TesterToolkit().getTools(),
            });

            const result = await agentExecutor.pipe(outputChain)
                .invoke({
                        input: task, chat_history: [
                            new SystemMessage(`For this conversation, assume the role of the most experience JavaScript developer in the world. We are going to be generating a series of PlayWright interactive end-to-end JavaScript tests, use ESM syntax. I will provide you with HTML in the next message. As part of this conversation, do not generate duplicate tests for the same components, instead find new ones in the given HTML.
                        You need to create a passing test case with several assertions for that HTML structure, one component at a time. 
                        To import the PlayWright interface use the following code: "import {{ test, expect }} from '@playwright/test'". Your task is to create a passing test case for the requested task, try to achieve the goal by interacting with forms links and js methods.
                Please do not add any additional text in the response, just return the code!
               for the given html  .
                Include a short name of the component in a few words in the response wrapped in "$$" characters, use snake case format inside of test with a JavaScript comment. If a component is a form, try to interact with the form.
                If the component includes links, then try to interact with the links.`),

                            new HumanMessage(`Here is the HTML for a website hosted at ${url}, html is ${html} , the task is ${task}`)
                        ]
                    }
                );
            return JSON.stringify(result);

        }
    });
