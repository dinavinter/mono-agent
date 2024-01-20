// ///@ts-ignore 
//
// import type {Message} from 'ai/react';
// import {useChat} from 'ai/react';
// import {FunctionCallHandler} from 'ai';
// import {nanoid} from 'ai';
// import {AutoGPTTester} from '@mono-agent/e2e'
// import {ActionFunctionArgs} from "@remix-run/node";
// import { defer } from '@vercel/remix';
//
//  // import { serverOnly$ } from "vite-env-only";
//
// // IMPORTANT! Set the runtime to edge when deployed to vercel
// // export const config = { runtime: 'edge' };
//
// 
// export async function action({ request }: ActionFunctionArgs) {
//     const { messages } = await request.json();
//     console.log(messages);
//     const agentExecutor = await AutoGPTTester();
//     const agentRun = agentExecutor.run(messages);
//     // const data = new experimental_StreamData();
// 
//     const stream= new ReadableStream({
//         async start(controller) {
//             const streaming:{isDone: boolean, messages:{content: any; name?: string;}[], error:any   } ={} as any;
//                 
//             agentRun.then((stream) => {
//                 streaming.isDone = true;
//                 streaming.messages = agentExecutor.fullMessageHistory;
//                 controller.close(); 
//             })
//             .catch((error) => {
//                 streaming.isDone = true;
//                 streaming.error = error;
//                 streaming.messages = agentExecutor.fullMessageHistory; 
//                 controller.close();
//             });
//            
//              while (!streaming.isDone) {
//                  agentExecutor.fullMessageHistory.filter(m=>!streaming.messages.indexOf(m)).forEach( (message) => {
//                      controller.enqueue(message);
//                      streaming.messages.push(message);
//                 
//              });
//              await new Promise((resolve) => setTimeout(resolve, 1000));
//              }
//         }
//     });
//     return defer({ 
//        stream
//     });
//     
//
//   
// }
//
// function evalInBrowser() {
//     const functionCallHandler: FunctionCallHandler = async (
//         chatMessages,
//         functionCall,
//     ) => {
//         if (functionCall.name === 'eval_code_in_browser') {
//             if (functionCall.arguments) {
//                 // Parsing here does not always work since it seems that some characters in generated code aren't escaped properly.
//                 const parsedFunctionCallArguments: { code: string } = JSON.parse(
//                     functionCall.arguments,
//                 );
//                 // WARNING: Do NOT do this in real-world applications!
//                 // eslint-disable-next-line no-eval
//                 eval(parsedFunctionCallArguments.code);
//                 return {
//                     messages: [
//                         ...chatMessages,
//                         {
//                             id: nanoid(),
//                             name: 'eval_code_in_browser',
//                             role: 'function' as const,
//                             content: parsedFunctionCallArguments.code,
//                         },
//                     ],
//                 };
//             }
//         }
//     };
//     return functionCallHandler;
// }
//
// export default function Chat() {
// 
//     const { messages, input, handleInputChange, handleSubmit, setInput    } = useChat({
//          api: '/chat'
//     });
//    
// 
//     // Generate a map of message role to text color
//     const roleToColorMap: Record<Message['role'], string> = {
//         system: 'red',
//         user: 'black',
//         function: 'blue',
//         assistant: 'green',
//         data: 'black',
//         tool: 'gray'
//     };
//     
//     return (
//         <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
//             {messages.length > 0
//                 ? messages.map((m: Message) => (
//                     <div
//                         key={m.id}
//                         className="whitespace-pre-wrap"
//                         style={{ color: roleToColorMap[m.role] }}
//                     >
//                         <strong>{`${m.role}: `}</strong>
//                         {m.content || JSON.stringify(m.function_call)}
//                         <br />
//                         <br />
//                     </div>
//                 ))
//                 : null}
//             <div id="chart-goes-here"></div>
//             <form method="post" action={"/chat"} onSubmit={handleSubmit}>
//                
//                 
//                 <input
//                     className="fixed bottom-1 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
//                     value={input}
//                     placeholder="Say something..."
//                     onChange={handleInputChange}
//                 />
//             </form>
//
// 
//             <button className={ "fixed bottom-0  w-full rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 "} aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label" onClick={() => {
//                 setInput('test register flow at https://gigya.login.dynidp.com/pages/login');
//              }}>test register flow at https://gigya.login.dynidp.com/pages/login'
//             </button>
//          
//
//
//         </div>
//     );
// }