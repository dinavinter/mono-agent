/*
import {z} from "zod";
import {ChainTool, DynamicStructuredTool} from "langchain/tools";
import {LLMChain} from "langchain/chains";
import {ChatOpenAI} from "langchain/chat_models/openai";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {EntityMemory} from "langchain/memory";
import {AgentExecutor, AgentStep} from "langchain/agents";
import {createStructuredOutputChain} from "langchain/chains/openai_functions";
import {RunnableSequence} from "langchain/runnables";
import {Tool} from "@langchain/core/tools";
import {renderTextDescription} from "langchain/tools/render";
import {formatXml} from "langchain/agents/format_scratchpad/xml";
import {XMLAgentOutputParser} from "langchain/agents/xml/output_parser";
import {ChatAnthropic} from "langchain/chat_models/anthropic";

const MODEL = "gpt-4-32k"
const testGeneratorSchema = z.object({
    url: z.string().url(),
    html: z.string(),
    input: z.string()
 });

const memory = new EntityMemory({
    llm: new OpenAI({ temperature: 0 }),
    chatHistoryKey: "history", // Default value
    entitiesKey: "tests", // Default value
});
 
export const TestTool = new DynamicStructuredTool({
    name: "test",
    description: "Generates and fix PlayWright tests for a given HTML page hosted at a URL, it can also fix previous generated test if the error is provided",
    schema: testGeneratorSchema,
    
    async func({url, html, input}: z.infer<typeof testGeneratorSchema>){
         const result =await multiPromptChain.call({url, html, input: input});
         return JSON.stringify(result);
}})


function Assit() {
    // Define the model with stop tokens.
    const model = new ChatAnthropic({ temperature: 0 }).bind({
        stop: ["</tool_input>", "</final_answer>"],
    });


    const template = `You are a helpful assistant. Help the user answer any questions.

You have access to the following tools:

{tools}

In order to use a tool, you can use <tool></tool> and <tool_input></tool_input> tags. \
You will then get back a response in the form <observation></observation>
For example, if you have a tool called 'search' that could run a google search, in order to search for the weather in SF you would respond:

<tool>search</tool><tool_input>weather in SF</tool_input>
<observation>64 degrees</observation>

When you are done, respond with a final answer between <final_answer></final_answer>. For example:

<final_answer>The weather in SF is 64 degrees</final_answer>

Begin!

Question: {input}`;


    const prompt = ChatPromptTemplate.fromMessages([
        ["human", template],
        ["ai", "{agent_scratchpad}"],
    ]);

    const outputParser = new XMLAgentOutputParser();


    const runnableAgent = RunnableSequence.from([
        {
            input: (i: { input: string; tools: Tool[]; steps: AgentStep[] }) => i.input,
            tools: (i: { input: string; tools: Tool[]; steps: AgentStep[] }) =>
                renderTextDescription(i.tools),
            agent_scratchpad: (i: {
                input: string;
                tools: Tool[];
                steps: AgentStep[];
            }) => formatXml(i.steps),
        },
        prompt,
        model,
        outputParser,
    ]);


}

const generatorAgent= createStructuredOutputChain({
    llm:  new ChatOpenAI({
        temperature: 0.7, modelName: MODEL
    }),
    prompt:ChatPromptTemplate.fromTemplate(`
         For this conversation, assume the role of the most experience JavaScript developer in the world. We are going to be generating a series of PlayWright interactive end-to-end JavaScript tests, use ESM syntax. I will provide you with HTML in the next message. As part of this conversation, do not generate duplicate tests for the same components, instead find new ones in the given HTML.
         You need to create a passing test case with several assertions for that HTML structure, one component at a time. To import the PlayWright interface use the following code: "import {{ test, expect }} from '@playwright/test'". Your task is to create a passing test case for one component at a time. Please do not add any additional text in the response, just return the code!
         Here is the HTML for a website hosted at {url}, generate comprehensive a PlayWright test file for the first component on this web page, make sure to navigate to the provided url in the test. Include a short name of the component in a few words in the response wrapped in "$$" characters, use snake case format inside of test with a JavaScript comment. If a component is a form, try to interact with the form. If the component includes links, then try to interact with the links.
         """{html}""" 
       
        Context:
        {tests}
        
        Current conversation:
        {history}
         `),
    outputSchema:z.object({
        test: z.string().describe("playwright test code"),
        name: z.string().describe("the test name"),
        component:z.string().describe("the component name")

    }),
    memory: memory
});

export const TestWriterChainTool =()=> new DynamicStructuredTool({
 schema: testGeneratorSchema,
 func: async (input, runManager) => {
     const result =await generatorAgent.call(input);
     return await generatorAgent.stream(input, runManager);
      
 }   
} )

*/

/*

export const TestChainTool =()=> new ChainTool({
    name: "test",
    description: "Generates PlayWright tests for a given HTML page hosted at a URL",
    chain: multiPromptChain,
    
})
  
export const StructuredTestWriterTool =()=> new DynamicStructuredTool({
    name: "test_writer",
    description: "Generates PlayWright tests for a given HTML page hosted at a URL",
    schema: z.object({
        url: z.string().url(),
        html: z.string()
      }),
    async func({url, html}){
        const runnable = await createOpenAIToolsAgent(
            {
                prompt: baseTemplate,
                llm: new ChatOpenAI({temperature: 0.7, modelName: MODEL}),
                tools: [
                    TestWriterChainTool(),
                    TestFixerChainTool(),
                    TestComponentChainTool()
        
                ] 
            }
        
        )
        const result =await runnable
            .invoke({url, html});
        console.log("StructuredTestWriterTool-result", result);
        return JSON.stringify(result);
       
     }
})
    





// const chainTest=   createOpenAIToolsAgent(
//     {
//         prompt: baseTemplate,
//         llm: new ChatOpenAI({temperature: 0.7, modelName: MODEL}),
//         tools: [
//             TestWriterChainTool(),
//             TestFixerChainTool(),
//             TestComponentChainTool()
//
//         ] 
//     }
//
// )
         



 
 
 ////
 
 
 const memory = new EntityMemory({
    llm: new OpenAI({ temperature: 0 }),
    chatHistoryKey: "history", // Default value
    entitiesKey: "tests", // Default value
});

const baseTemplate= ChatPromptTemplate.fromTemplate(`
For this conversation, assume the role of the most experience JavaScript developer in the world. We are going to be generating a series of PlayWright interactive end-to-end JavaScript tests, use ESM syntax. I will provide you with HTML in the next message. As part of this conversation, do not generate duplicate tests for the same components, instead find new ones in the given HTML.
        You need to create a passing test case with several assertions for that HTML structure, one component at a time. To import the PlayWright interface use the following code: "import {{ test, expect }} from '@playwright/test'". Your task is to create a passing test case for one component at a time. 
        Please do not add any additional text in the response, just return the code!
        Here is the HTML for a website hosted at {url}, generate comprehensive a PlayWright test file for the first component on this web page, make sure to navigate to the provided url in the test. 
        Include a short name of the component in a few words in the response wrapped in "$$" characters, use snake case format inside of test with a JavaScript comment. If a component is a form, try to interact with the form. 
        If the component includes links, then try to interact with the links.
        
        Context:
        {tests}
        
        Current conversation:
        {history}
`);


const multiPromptChain = MultiPromptChain.fromLLMAndPrompts(new ChatOpenAI(), {
    llmChainOpts:{ 
        memory: memory,
        metadata: {name: "test", description: "Generates and fix PlayWright tests for a given HTML page hosted at a URL" },
        llmKwargs: {temperature: 0.7, modelName: MODEL}
     },
    conversationChainOpts:{
        prompt: ChatPromptTemplate.fromTemplate(`For this conversation, assume the role of the most experience JavaScript developer in the world. We are going to be generating a series of PlayWright interactive end-to-end JavaScript tests, use ESM syntax. I will provide you with HTML in the next message. As part of this conversation, do not generate duplicate tests for the same components, instead find new ones in the given HTML.
        You need to create a passing test case with several assertions for that HTML structure, one component at a time. To import the PlayWright interface use the following code: "import {{ test, expect }} from '@playwright/test'". Your task is to create a passing test case for one component at a time. 
        Please do not add any additional text in the response, just return the code!
        Here is the HTML for a website hosted at {url}, generate comprehensive a PlayWright test file for the first component on this web page, make sure to navigate to the provided url in the test. 
        Include a short name of the component in a few words in the response wrapped in "$$" characters, use snake case format inside of test with a JavaScript comment. If a component is a form, try to interact with the form. 
        If the component includes links, then try to interact with the links.
        
        Context:
        {tests}
        
        Current conversation:
        {history}

        `),
        
    },
    promptDescriptions: [
        'Useful for generating PlayWright tests for a given HTML page hosted at a URL',
        'Useful for fixing a PlayWright test',
        'Useful for generating more components of PlayWright tests for a given HTML page hosted at a URL',
       ],
    promptNames: [
        'write-test',
        'fix-test',
        'more-components'
    ],
     
    promptTemplates: [ 
        `Generate comprehensive a PlayWright test file for the first component on this web page.`,
        `I got an error running the test, please try to fix the code to make the test pass. You likely need to update the assertions to match the expected and please output all of the code for the test file fixed, so I copy it and run it. `,
        `This is great, let us proceed with an interactive test with several assertions for component that you have not generated a test for already. For example, components could be the navigation bar, the search bar, footer links, the login form. Include a short name of the component in a few words in the response wrapped in "$$" characters, use snake case format inside of test with a JavaScript comment.`
        
     ],
    defaultChain: new LLMChain({
        prompt: baseTemplate,
        llm: new OpenAI({temperature: 0.7, modelName: MODEL}),
        memory: memory
    }),
    multiRouteChainOpts:{
        routerChain:  
            LLMRouterChain.fromLLM(new OpenAI({temperature: 0.7, modelName: MODEL}), 
            PromptTemplate.fromTemplate(`For this conversation, assume the role of the most experience JavaScript developer in the world. We are going to be generating a series of PlayWright interactive end-to-end JavaScript tests, use ESM syntax. I will provide you with HTML in the next message. As part of this conversation, do not generate duplicate tests for the same components, instead find new ones in the given HTML.
        You need to create a passing test case with several assertions for that HTML structure, one component at a time. To import the PlayWright interface use the following code: "import {{ test, expect }} from '@playwright/test'". Your task is to create a passing test case for one component at a time. 
        Please do not add any additional text in the response, just return the code!
        Here is the HTML for a website hosted at {url}, generate comprehensive a PlayWright test file for the first component on this web page, make sure to navigate to the provided url in the test. 
        Include a short name of the component in a few words in the response wrapped in "$$" characters, use snake case format inside of test with a JavaScript comment. If a component is a form, try to interact with the form. 
        If the component includes links, then try to interact with the links.
        
        Context:
        {tests}
        
        Current conversation:
        {history}

        `),{
            memory: memory,
                    
                }),
        destinationChains:{
            "write-test": new LLMChain({
                prompt:  ChatPromptTemplate.fromTemplate('Generate comprehensive a PlayWright test file for the first component on this web page.'),
                llm: new OpenAI({temperature: 0.7, modelName: MODEL}),
                memory: memory
              }
            ),
            'fix-test': new LLMChain({
                prompt: ChatPromptTemplate.fromTemplate(`I got an error running the test:  {error} , please try to fix the code to make the test pass. You likely need to update the assertions to match the expected and please output all of the code for the test file fixed, so I copy it and run it. `),
                llm: new OpenAI({temperature: 0.7, modelName: MODEL}),
                memory: memory
              }
            ),
            'more-components': new LLMChain({
                prompt: ChatPromptTemplate.fromTemplate(`This is great, let us proceed with an interactive test with several assertions for component that you have not generated a test for already. For example, components could be the navigation bar, the search bar, footer links, the login form. Include a short name of the component in a few words in the response wrapped in "$$" characters, use snake case format inside of test with a JavaScript comment.`),
                llm: new OpenAI({temperature: 0.7, modelName: MODEL}),
                memory: memory
            })
            
            
        }
    }
 });
    

*/

import {ChainTool} from "langchain/tools";
import {LLMChain} from "langchain/chains";
import {OpenAI} from "@langchain/openai";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {Toolkit} from "langchain/agents";
import {EntityMemory} from "langchain/memory";

export class TesterToolkit extends Toolkit {
    tools :ChainTool[]

    constructor() {
        super();
        this.memory = new EntityMemory({
            llm: new OpenAI({temperature: 0}),
            chatHistoryKey: "history", 
            entitiesKey: "tests",  
        });
        this.tools = [
            TesterToolkit.TestWriterChainTool(this),
            TesterToolkit.TestFixerChainTool(this),
            TesterToolkit.TestComponentChainTool(this),
        ];
    }
    memory = new EntityMemory({
        llm: new OpenAI({temperature: 0}),
        chatHistoryKey: "history", // Default value
        entitiesKey: "tests", // Default value
    });
 
    static fromMemory(memory?: EntityMemory){
        return memory && `Context:
        {${memory.entitiesKey}
        
        Current conversation:
        {${memory.chatHistoryKey}}
         `
    }
    static TestWriterChainTool ({memory}: {memory?:EntityMemory}) {

        return new ChainTool({
            name: "test_writer",
            description: "Generates PlayWright tests for a given HTML page hosted at a URL",
            chain: new LLMChain({
                llm: new OpenAI({temperature: 0.7}),
                prompt: ChatPromptTemplate.fromTemplate(`
         For this conversation, assume the role of the most experience JavaScript developer in the world. We are going to be generating a series of PlayWright interactive end-to-end JavaScript tests, use ESM syntax. I will provide you with HTML in the next message. As part of this conversation, do not generate duplicate tests for the same components, instead find new ones in the given HTML.
         You need to create a passing test case with several assertions for that HTML structure, one component at a time. To import the PlayWright interface use the following code: "import {{ test, expect }} from '@playwright/test'". Your task is to create a passing test case for one component at a time. Please do not add any additional text in the response, just return the code!
         Here is the HTML for a website hosted at {url}, generate comprehensive a PlayWright test file for the first component on this web page, make sure to navigate to the provided url in the test. Include a short name of the component in a few words in the response wrapped in "$$" characters, use snake case format inside of test with a JavaScript comment. If a component is a form, try to interact with the form. If the component includes links, then try to interact with the links.
         """{html}""" 
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


const baseTemplate= ChatPromptTemplate.fromTemplate(`
For this conversation, assume the role of the most experience JavaScript developer in the world. We are going to be generating a series of PlayWright interactive end-to-end JavaScript tests, use ESM syntax. I will provide you with HTML in the next message. As part of this conversation, do not generate duplicate tests for the same components, instead find new ones in the given HTML.
        You need to create a passing test case with several assertions for that HTML structure, one component at a time. To import the PlayWright interface use the following code: "import {{ test, expect }} from '@playwright/test'". Your task is to create a passing test case for one component at a time. 
        Please do not add any additional text in the response, just return the code!
        Here is the HTML for a website hosted at {url}, generate comprehensive a PlayWright test file for the first component on this web page, make sure to navigate to the provided url in the test. 
        Include a short name of the component in a few words in the response wrapped in "$$" characters, use snake case format inside of test with a JavaScript comment. If a component is a form, try to interact with the form. 
        If the component includes links, then try to interact with the links.
        
        Context:
        {tests}
        
        Current conversation:
        {history}
`);

 
