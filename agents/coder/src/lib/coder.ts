import {ChatCompletion} from "openai/resources";
import {chain} from 'prompt-template'
import {ChatOpenAI} from "langchain/chat_models/openai";
import OpenAI from "openai";
import {env} from "process";

// The OpenAI functions we want to use in our model.
const functions = [
  {
    name: "exec_code",
    description:
        "Executes the passed JavaScript code using Nodejs and returns the stdout and stderr. Always produce valid JSON.",
    parameters: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "The JavaScript code to execute.",
        },
      },
      required: ["code"],
    },
  },
];

async function parseGptResponse(response: ChatCompletion) {
  const message = response.choices[0].message;
  const content = message["content"];
  const func = message["function_call"];

  function getCode() {
    if (func) {
      const funcName = func["name"];

      // Get rid of newlines and leading/trailing spaces in the raw function arguments JSON string.
      // This sometimes help to avoid JSON parsing errors.
      let args = func["arguments"];
      args = args.trim().replace(/\n|\r/g, "");
      // Parse the cleaned up JSON string.
      const funcArgs = JSON.parse(args);

      // If the model is calling the exec_code function we defined in the `functions` variable, we want to save the `code` argument to a variable.
      if (funcName === "exec_code") {
        return  funcArgs["code"];

      }
    }
  }

  const code = getCode();
  console.log(content, code);
  return { content ,code };

}

const {
  AZURE_OPENAI_API_DEPLOYMENT_NAME,
  AZURE_OPENAI_API_COMPLETIONS_DEPLOYMENT_NAME,
  AZURE_OPENAI_BASE_PATH,
  AZURE_OPENAI_API_KEY
} = env;
const openai = new ChatOpenAI( {
  azureOpenAIApiDeploymentName: AZURE_OPENAI_API_DEPLOYMENT_NAME,
  azureOpenAIApiKey: AZURE_OPENAI_API_KEY,
  azureOpenAIBasePath: AZURE_OPENAI_BASE_PATH,
  azureOpenAIApiCompletionsDeploymentName: AZURE_OPENAI_API_COMPLETIONS_DEPLOYMENT_NAME,
  
});

export async function code(task:string, examples:string) {
  const res = await chain.call({
    task,
    domain: "lang-chain integration",
    language: "english",
    examples
  },[  {
    handleLLMNewToken(token: string) {
      process.stdout.write(token);
    },
  }]);
  console.log({res});
  return res.toString();
}

  
export async function Coder(prompt: string="Generate first 100 fibonacci numbers") {
  const chatCompletion = await new OpenAI().chat.completions.create({
    model: "gpt-3.5-turbo-16k", // Or use 'gpt-3.5-turbo'
    messages: [
      {
        role: "system",
        content: "You are a senior developer that can code in JavaScript.",
      },
      {
        role: "user",
        content: "Write hello world",
      },
      {
        role: "assistant",
        content: null,
        function_call: {
          arguments: '{"code": "console.log("hello world")"}',
          name: "exec_code",
        }
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    functions,
  });

  return await parseGptResponse(chatCompletion);
}

 