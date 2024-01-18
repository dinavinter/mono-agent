import {
  ActorRefFrom,
  AnyActor,
  assign,
  ContextFrom,
  EventFrom,
  fromPromise,
  OutputFrom,
  setup,
  StateFrom,
} from 'xstate';
import {taskMachine} from './task';
import {BrowserContext} from '@playwright/test';
import {Page} from 'playwright';
import {BaseChatModel} from 'langchain/dist/chat_models/base';
import {BaseContext,   contextFactoryWith, entitySet, EntitySet} from './common';
import {Browser} from 'langchain/dist/document_loaders/web/puppeteer';

export type Message = {
  role: 'human' | 'bot',
  content: any
}

export const pageMachineSetup = setup({

  types: {
    input: {} as {
      url: string,
      page?: Page,
      chatApi: BaseChatModel,
      sender?: AnyActor,
      browser: BrowserContext
    } & BaseContext,
    context: {} as {
      tasks: EntitySet<ActorRefFrom<typeof taskMachine>>,
      completedTasks: EntitySet<OutputFrom<typeof taskMachine>>,
      page: Page,
      messages: EntitySet<Message>,
      url: string,
      chatApi: BaseChatModel,
      sender?: AnyActor,
      browser: BrowserContext
    } & BaseContext,
  },
  actions: {
    assignPage: assign({
      page: ({event:{output}}) => output
    }),
    assignNewTask: assign({
      tasks: ({context: {tasks, messages, page, chatApi, outputFilePath, ...options}, event: {task}, spawn, self}) =>{
        const taskActor= spawn('taskMachine', {
           systemId: `tasks-${tasks.autoIncrementId.next()}`,
           input: {
             page: page,
             task: task,
             chatApi: chatApi,
             outputFilePath,
             sender: self
           },
         });
        return tasks.push(taskActor);
      },
    }),
    assignCompletedTask: assign({
      tasks: ({context: {tasks}, event}) => tasks.removeAt(event.output.id),
      completedTasks: ({context: {completedTasks}, event}) => completedTasks.push(event.output),
    }),

  },
  guards: {
    pageNotReady: ({context}) => !context.page,
    pageReady: ({context}) => context.page?.url() === context.url,
  },
  actors: {
    'loadPage': fromPromise(async ({input: {browser, url}}: {
      input: {browser: BrowserContext, url: string}
    }) => {
      const page = await browser.newPage();
      await page.goto(url);
      return page;
    }),
    'taskMachine': taskMachine
  }

  
});
export const pageMachine = pageMachineSetup.createMachine({
  context: contextFactoryWith({
    tasks: entitySet<ActorRefFrom<typeof taskMachine>>(),
    messages: entitySet<Message>()
  }),
  initial: 'loading',
  states: {
    loading: {
      always: [{
        guard: 'pageReady',
        target: 'loaded',
      }, {
        guard: 'pageNotReady',
        target: "navigating"

      }]
    },
    navigating: {
      invoke: {
        src: 'loadPage',
        input: ({context}) => ({
          browser: context.browser,
          url: context.url
        }),
        onDone: {
          target: 'loaded',
          actions: 'assignPage',
        }
      },
      loaded: {
        on: {
          task: {
            actions: 'assignNewTask',
          },
          'task.done': {
            actions: 'assignCompletedTask',
          },
        }
      },

    },
  }
});

export type PageMachine = typeof pageMachine;
export type PageMachineOutput = OutputFrom<PageMachine>;
 export type PageMachineContext = ContextFrom<PageMachine>;
export type PageMachineEvent = EventFrom<PageMachine>;
export type PageMachineState = StateFrom<PageMachine>
export type PageMachineActor = ActorRefFrom<PageMachine>;
export type  PageServiceSnapshot = ReturnType<PageMachineActor["getSnapshot"]>;
