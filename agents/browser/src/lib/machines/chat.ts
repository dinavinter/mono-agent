import {
  ActorRefFrom,
  assign,
  ContextFrom, createActor,
  DoneActorEvent,
  ErrorActorEvent,
  fromPromise,
  OutputFrom, raise,
  sendTo,
  setup, SnapshotFrom,
} from 'xstate';
import {doActionWithAutoGPT} from '../autogpt';
import {createTestFileAsync} from '../util';
import {chromium, Page} from 'playwright';
import {BaseChatModel} from 'langchain/dist/chat_models/base';
import {BrowserContext} from '@playwright/test';
import {contextFactory, contextFactoryWith, EntitySet} from './common';
import {Message, pageMachine} from './page';
import {taskMachineSetup} from './task';


    
 
 
 

 

  
 
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


export type WebChatMachine =  ReturnType<typeof webChatMachineSetup.createMachine>;




export const webChatMachineSetup =  setup({
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
      pages: ({context: {pages, chatApi, browser, outputFilePath}, event, spawn}) => pages.push(spawn('pageGPT', {
          id: "page-gpt",
          systemId: `page-gpt-${pages.autoIncrementId.next()}`,
          input: {
            url: event.type === "page" && event.url || 'https://www.google.com',
            chatApi: chatApi,
            browser: browser!,
            outputFilePath
          },
          syncSnapshot: true,
        }
      )),
    }),
  
     logSnapshot: ({event}) => console.log(event),
  },
  types: {
    context: {} as {
      browser: BrowserContext | undefined,
      viewport: string | undefined,
      outputFilePath: string,
      chatApi: BaseChatModel ,
      messages: EntitySet<Message>
      errors: EntitySet<any>,
      pages: EntitySet<ActorRefFrom<typeof pageMachine> >,
    },
    events: {} as
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
export const webChatMachine = webChatMachineSetup
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
  })




export type WebChatService = ActorRefFrom<WebChatMachine>
export type WebChatServiceSnapshot = ReturnType<WebChatService["getSnapshot"]>;
export const createWebChatService = (options: Parameters<typeof createActor<typeof  webChatMachine>>[1]):WebChatService => {
  return createActor(webChatMachine, { inspect: {
      next(state) {
        console.log("next", state);
      },
      error(state) {
        console.log("error", state);
      }
    },...options});
}

export const WebChatMachine = webChatMachine;

   