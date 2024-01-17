import OpenAI from 'openai';
import 'dotenv/config';
import functions from "@/sandbox/ai-dev/src/lib/functions";
import {AIDeveloperSandbox} from "@/sandbox/ai-dev";


 
export async function createAIDeveloperAssistant() {
    const openai = new OpenAI();

    const aiDeveloper = await openai.beta.assistants.create({
        instructions: `You are an AI developer.
    The provided codebase is in the /home/user/repo.
    When given a coding task, you will work on it until it is completed. You will summarize your steps.
    If you encounter some problem, just communicate it please. 
    You can save code to file (or create a new file), list files in a given directory, read files, and commit and push changes.
    Please every time you are asked to do a task, do the task the best you can, and then commit and push it without asking.
    You are professional, don't argue, and just complete the task.`,
        name: 'AI Developer',
        tools: [...functions],
        model: 'gpt-4-1106-preview',
    });

    console.log('AI Developer Assistant created, copy its id to .env file:');
    console.log(aiDeveloper.id);
    
    
    return AIDeveloperSandbox({assistant_id:aiDeveloper.id, openai});
}

