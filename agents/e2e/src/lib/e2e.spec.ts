import {AutoGPTTester, PlaywrightAutoGpt, tester} from './e2e';
import {AgentExecutor, ChatAgentOutputParser, createReactAgent} from "langchain/agents";
import {htmlRetrieverTool} from "./htmlRetrieverTool";
import {TesterToolkit} from "./plTool";
import {ChatOpenAI} from "@langchain/openai";
import {pull} from "langchain/hub";
import {PromptTemplate} from "langchain/prompts";
import {PlaywrightInterceptorTool} from "./playwrightInterceptorTool";
import {mkdtempSync} from "node:fs";
import fs from "fs";
import {ChatPromptTemplate} from "@langchain/core/prompts";

const task= 'test register and login at https://login.gigen.zon.cx/pages/login';

describe.skip('tester', () => {
  test.concurrent('should work', async () => {
    const agentExecutor = await PlaywrightAutoGpt();
    const task ='test register flow at https://gigya.login.dynidp.com/pages/login'
      const chat = ChatPromptTemplate.fromTemplate(
         `For this conversation, assume the role of the most experience JavaScript developer in the world.You are a highly skilled playwright tester equipped with advanced OpenAI capabilities,We are going to be generating a series of PlayWright interactive end-to-end JavaScript test. 
            I will provide you with a flow to test in  a specific url as part of this conversation, Your task is to understand and interpret test requirements, use the provided tools to configure PlayWright correctly and write a PlayWright tests efficiently.
            instructions:        
            save the tests in the root directory with the .spec.ts extension, and execute these tests accordingly. Use your expertise to handle various testing scenarios and provide detailed feedback on test outcomes. 
            Remember to make sure to save the tests with a new file spec and then pass them to an the test execute tool.
           inspect the url requested in the test to create more context for the test, if the test fails  you try to fix the test  and try again  . 
             use ESM syntax. 
              do not generate duplicate tests for the same components, instead find new ones in the given HTML.
                        You need to create a passing test case with several assertions for that HTML structure, one component at a time. 
                        To import the PlayWright interface use the following code: "import {{ test, expect }} from '@playwright/test'". Your task is to create a passing test case for the requested task, try to achieve the goal by interacting with forms links and js methods.
                Please do not add any additional text in the response, just return the code!
               for the given html  .
                Include a short name of the component in a few words in the response wrapped in "$$" characters, use snake case format inside of test with a JavaScript comment. If a component is a form, try to interact with the form.
                If the component includes links, then try to interact with the links.
               
                {task}
                `);
      ``;


      const chainValues=await agentExecutor.invoke({
      input:  await chat.format({task})

    })
    console.log(chainValues);
 
  }, 100000);
 } 
);

describe.skip('react', () => {
  test.concurrent('should work', async () => {
     await react()
  })
  
async function react() {
  fs.mkdirSync("agents/e2e/dist", {recursive: true});
  const agentTemplate = await pull<PromptTemplate>("langchain-ai/react-agent-template");


  const agent = await createReactAgent({
    tools: [await htmlRetrieverTool(), ...new TesterToolkit().getTools()],
    llm: new ChatOpenAI({modelName: "gpt-4-32k", temperature: 0.7}),

    prompt: await agentTemplate.partial({
      instructions: `You are a highly skilled playwright tester equipped with advanced OpenAI capabilities.
        Your task is to understand and interpret test requirements, use the provided tools to configure cypress correctly, write playwright tests efficiently,
        save the tests in the root directory with the .spec.ts extension, and execute these tests accordingly. Use your expertise to handle various testing scenarios and provide detailed feedback on test outcomes.
        Remember to make sure to save the tests with a new file spec and then pass them to an the test execute tool.
        inspect the url requested in the test to create more context for the test, if the test fails suggest where the code  could be wrong, if the  the problem is with the test fix it and try again, if the problem is with the code suggest where the code could be wrong and how to fix it. save the test results in the root directory
        `,

    })

  });
  const executable = AgentExecutor.fromAgentAndTools(
      {
        agent: agent, tools: [new PlaywrightInterceptorTool({
          directory: mkdtempSync("agents/e2e/dist/langchain-")

        })], verbose: true, returnIntermediateSteps: true
      }
  )
  const results =await executable.run([task]);
  console.log("react", JSON.stringify(results))
}
})

describe('autogpt', () => {
      const task= 'test register flow at https://gigya.login.dynidp.com/pages/register';
      test.concurrent('should work', async () => {
        
        const autoGPt=await AutoGPTTester()
        const results =await autoGPt.run([task]);
        console.log("autoGPt", JSON.stringify(results))
 
         
        
      }, 600000);
    }
);