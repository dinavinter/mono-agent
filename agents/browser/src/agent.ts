// import {AgentInput} from 'langchain/dist/agents/types';
// import {ActorRefFrom} from 'xstate';
// import {ChatMachine} from './lib/machines/chat';
// import {Agent} from 'langchain/agents';
// import {doActionWithAutoGPT} from './lib/autogpt';
//
// export type BrowserAgentOptions = AgentInput & {
//   request: ReadableStream<{
//     message: string;
//   }>;
//   response: WritableStream<{
//     message: string;
//   }>;
//   url?: string;
//   viewport?: string;
//   outputFilePath?: string;
//   auto?: boolean;
//   chatMachine?: ActorRefFrom<ChatMachine>;
// }
//
// export  class BrowserAgent extends Agent {
//   private request: BrowserAgentOptions["request"]
//   private response: BrowserAgentOptions["response"]
//   private url: BrowserAgentOptions["url"] ;
//   private viewport: BrowserAgentOptions["viewport"];
//   private outputFilePath: BrowserAgentOptions["outputFilePath"];
//   private auto: BrowserAgentOptions["auto"];
//   private llmChain: BrowserAgentOptions["llmChain"];
//   private chatMachine: BrowserAgentOptions["chatMachine"];
//   constructor(options: BrowserAgentOptions ) {
//     super(options);
//     Object.assign(this, options);
//
//   }
//   async run() {
//     const {request, response} = this;
//     const reader = request.getReader();
//     const writer = response.getWriter();
//     while (true) {
//       const {done, value} = await reader.read();
//       if (done) {
//         await writer.close();
//         return;
//       }
//       const {message} = value;
//       const result = await this.handleMessage(message);
//       await writer.write({message: result});
//     }
//   }
//
//   async handleMessage(message: string) {
//     if(this.auto) {
//       return await doActionWithAutoGPT(page, chatApi, task, options);
//     }
//   }
//
//
// }