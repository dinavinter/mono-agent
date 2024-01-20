import {
  ActorRefFrom, AnyEventObject,
  assign,
  ContextFrom, DoneActorEvent,
  ErrorActorEvent,
  fromPromise, OutputFrom, sendTo,
  setup, SnapshotFrom,
} from 'xstate';
import {doActionWithAutoGPT} from '../autogpt';
import {createTestFileAsync} from '../util';
import {chromium, Page, BrowserContext} from 'playwright';
import {BaseContext, contextFactoryWith, EntitySet} from './common';
import {Message, pageMachine, PageMachineActor} from './page';
 

    
 
 
 

 

  
 
// 
// const onRetry =[{
//     guard: inState('init'),
//     target: 'init',
//     reenter: true,
//   },
//     {
//       guard: inState('goToPage'),
//       target: 'goToPage',
//       reenter: true,
//     }
//     ,
//     {
//       guard: inState('interact'),
//       target: 'interact',
//       reenter: true,
//     },
//     {guard: inState('auto'), target: 'auto', reenter: true}];






const  webChatMachineSetup =  setup({
  actors: {
    createTestFile: fromPromise(({input: {outputFilePath}}: {
      input: {outputFilePath: string;};
    }) => createTestFileAsync({outputFilePath})),
    initBrowser: fromPromise(async ({input: {viewport}}: {input: {viewport: string;};}) => {
      const browser = await chromium.launch({headless: false});
      const [width, height] = viewport.split(',').map(Number);
      return await browser.newContext({
        viewport: {width, height},
      });
      
    }),
    pageAutoGPT: fromPromise(doActionWithAutoGPT),
    pageGPT: pageMachine,

  },
  actions: {
    assignBotMessage: assign({
      messages: ({context: {messages}, event}) => {
        return messages.add({role: 'bot', content: event});
      }
    }),
    assignHumanMessage: assign({
      messages: ({context: {messages}, event}) => {
        return messages.add({role: 'human', content: event});
      }
    }),
    sendTask: sendTo('page-gpt', ({event: {task}}: {event: {task: string}}) => ({
      type: 'task',
      task: task
    })),
    sendTaskToAutoGPT: sendTo('page-auto-gpt', ({event: {task}}: {event: {task: string}}) => ({
      type: 'task',
      task: task
    })),

    assignError: assign({
      errors: ({context: {errors}, event}) => {
        return errors.add(event);
      }
    }),
    assignBrowser: assign({
      browser: ({event: {output}}: {event: DoneActorEvent<BrowserContext>}) => output
    }),
    assignPageMachine: assign({
      pages: ({context: {pages, chatApi, browser, outputFilePath}, event, spawn}) => pages.add(
        {...
        spawn('pageGPT', {
          systemId: `${pages.autoIncrementId.next()}`,
          input: {
            url: event.type === "page" && event.url || 'https://www.google.com',
            chatApi: chatApi,
            browser: browser!,
            outputFilePath
          },
          syncSnapshot: true,
        }
      ), id: `${pages.autoIncrementId._id}`} ),
    }),
  
     logSnapshot: ({event}) => console.log(event),
  },
  types: {
    context: {} as {
      browser: BrowserContext | undefined,
      viewport: string | undefined,
      outputFilePath: string,
      messages: EntitySet<Message>
      errors: EntitySet<any>,
      pages: EntitySet<PageMachineActor >,
    }& BaseContext,
    events: {} as
      | AnyEventObject
      | { type: 'page.created'; page: Page }

      | { type: 'page' , url: string}
      | { type: 'task.new';  task: string }
      | { type: 'task.new.auto'; task: string }
      | { type: 'task.completed'; amount: number }
      | DoneActorEvent<BrowserContext>
      | DoneActorEvent<Page> 
      | ErrorActorEvent,

 
    children: {} as {
      'page-gpt': 'pageGPT';
      'page-auto-gpt': 'pageAutoGPT',
      'create-test-file': 'createTestFile'  ,
      'init-browser': 'initBrowser' ;
      
    }


  },

});


const webChatMachine = webChatMachineSetup
  .createMachine({
    context: contextFactoryWith(({input})=>({
      url: input.url || "https://www.google.com",
      viewport: input.viewport || "800,600" 
    })),
  initial: 'init', 
 
  states: {
    init: {
      onDone: 'browser',
      invoke: [{
        id: 'init-browser',
        src: 'initBrowser',
        input: ({context}) => ( {
          viewport: context.viewport || "800,600" 
        }),
        onDone: {
          actions: 'assignBrowser',
        } 
      }, {
        id: 'create-test-file',
        src: 'createTestFile',
        input: ({context}) => {return {
          outputFilePath: context.outputFilePath
        }},
          onError: {actions: 'assignError'}
        }
      ]
    },
    browser: {
      on: {
        'page': {
          actions: 'assignPageMachine',
          target: 'page',
         } 
        
        }
      },
    page: { 
      on: {
        'task.new': {
          actions: ['sendTask', 'assignHumanMessage']
         },
        'task.completed': {
          actions: ['assignBotMessage' ,]
         } 
        }
      } 
    }
  }) as ReturnType<(typeof webChatMachineSetup)["createMachine"]>;

export type WebChatMachineType =  typeof webChatMachine;
export  const WebChatMachine:WebChatMachineType = webChatMachine

export type WebChatContext = ContextFrom<typeof webChatMachine>;
export type WebChatEvent = OutputFrom<typeof webChatMachine>;
export type WebChatState = SnapshotFrom<typeof webChatMachine>;
 
export type WebChatService = ActorRefFrom<WebChatMachineType>
export type WebChatServiceSnapshot = ReturnType<WebChatService["getSnapshot"]>;

// export const createWebChatService = (options: Parameters<typeof createActor<typeof  webChatMachine>>[1]):WebChatService => {
//   return createActor(webChatMachine, { inspect: {
//       next(state) {
//         console.log("next", state);
//       },
//       error(state) {
//         console.log("error", state);
//       }
//     },...options});
// }


   