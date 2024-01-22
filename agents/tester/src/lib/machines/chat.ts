import {
  ActorRefFrom, AnyEventObject, AnyStateMachine,
  assign,
  ContextFrom, createActor, DoneActorEvent,
  ErrorActorEvent,
  fromPromise, OutputFrom, sendTo,
  setup, SnapshotFrom,
} from 'xstate';
import {doActionWithAutoGPT} from '../autogpt';
import {createTestFileAsync} from '../util';
import  {chromium, type Page, type BrowserContext} from 'playwright';
import {BaseContext, contextFactoryWith} from './common';
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
    pageGPT: pageMachine
  },
  actions: {
    assignBotMessage: assign({
      messages: ({context: {messages}, event}) => {
        return messages.concat({role: 'bot', content: event});
      }
    }),
    assignHumanMessage: assign({
      messages: ({context: {messages}, event}) => {
        return messages.concat({role: 'human', content: event});
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
        return errors.concat(event as ErrorActorEvent);
      }
    }),
    assignBrowser: assign({
      browser: ({event: {output}}: {event: AnyEventObject}) => output
    }),
    
    assignPageMachine: assign({
      pages: ({context: {pages, chatApi, browser, outputFilePath}, event, spawn}) => pages.concat(
        spawn('pageGPT', {
            id: 'page-gpt',
            systemId: `pages-${pages.length +1}`,
            input: {
              url: event.type === "page" && event.url || 'https://www.google.com',
              chatApi: chatApi,
              browser: browser!,
              outputFilePath
            },
            syncSnapshot: true,
          }))
        }),

      logSnapshot: ({event}) => console.log(event),
  },
  types: {
    context: {} as {
      browser: BrowserContext | undefined,
      viewport: string | undefined,
      outputFilePath: string,
      messages: Message[]
      errors: ErrorActorEvent[],
      pages: PageMachineActor[],
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
  }) ;

export type WebChatMachineType =  typeof webChatMachine;
export  const WebChatMachine:WebChatMachineType = webChatMachine

export type WebChatContext = ContextFrom<typeof webChatMachine>;
export type WebChatEvent = OutputFrom<typeof webChatMachine>;
export type WebChatState = SnapshotFrom<typeof webChatMachine>;
 
export type WebChatService = ActorRefFrom<WebChatMachineType>
export type WebChatServiceSnapshot = ReturnType<WebChatService["getSnapshot"]>; 



function loggerInspector() {
  return {
    next(state:any) {
      console.log('next', state);
    },
    error(state:any) {
      console.log('error', state);
    },
  };
}


export const createWebChatService = (options: Parameters<typeof createActor<typeof  webChatMachine>>[1]):WebChatService => {
  return createActor(webChatMachine, { 
    inspect: loggerInspector()
    ,...options});
}




/* with store, seems redundant
export type StoreFactory<TMachine extends AnyStateMachine, TActor extends  ActorRefFrom<TMachine> =ActorRefFrom<TMachine> >={
  (machine: TMachine): PromiseLike<{
    set: (state: SnapshotFrom<TActor>) => void;
    get: () => SnapshotFrom<TActor>;
  }>
}


export const createWebChatServiceWithStorage = async (options: Parameters<typeof createActor<typeof  webChatMachine>>[1] &{
  storeFactory:StoreFactory<WebChatMachineType>
}):Promise<WebChatService> => {
  const store = await options.storeFactory(WebChatMachine);


  const actor = createActor(webChatMachine, {
    snapshot: store.get(),
    inspect: loggerInspector(), ...options
  });

  actor.subscribe((state) => {
      store.set(state);
  });

   return actor;
}
     
      
 */