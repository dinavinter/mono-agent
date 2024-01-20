import {
  ActorRefFrom,
  AnyActor, AnyActorRef, AnyEventObject,
  assign,
  ContextFrom, DoneActorEvent, enqueueActions, ErrorActorEvent,
  EventFrom,
  fromPromise, Observer,
  OutputFrom,
  setup,
  StateFrom,
} from 'xstate';
import { taskMachine, TaskMachineActor, TaskMachineMachineOutput} from './task';
import type {Page, BrowserContext} from 'playwright';
import {BaseContext, BaseInput, contextFactoryWith} from './common';

export type Message = {
  role: 'human' | 'bot',
  content: any
}

type TaskEvent =   {
  type: 'task',
  task: string,
  feedback?: AnyActorRef
}  
export const pageMachineSetup = setup({

  types: {
    input: {} as {
      url: string,
      page?: Page,
      sender?: AnyActor,
      browser: BrowserContext
    } & BaseInput,
    context: {} as {
      tasks: TaskMachineActor[],
      currentTask?: TaskMachineActor,
      completedTasks: TaskMachineActor[],
      page: Page,
      messages: Message[],
      url: string,
      sender?: AnyActor,
      browser: BrowserContext
    } & BaseContext,
    events: {} as 
      | AnyEventObject
      | TaskEvent | {
      type: 'task.done',
      output: any
    } | {
      type: 'created',
      task: TaskMachineActor
    } |DoneActorEvent<Page> | ErrorActorEvent
  },
  actions: {
    assignPage: assign(({event:{output}}:AnyEventObject) => ({
      page:({event:{output}}:{event:DoneActorEvent<Page>}) =>    output
    })),
    onTaskCreated: ()=>{},
    // enqueueNewTask: enqueueActions(function({ context: {tasks, messages, page, chatApi, outputFilePath, ...options},  event, enqueue, system })  {
    //   const systemId=`tasks-${tasks.autoIncrementId.next()}`
    //   const {task, feedback} = event as TaskEvent
    //   enqueue.spawnChild('taskMachine',{
    //     systemId: systemId,
    //     input: {
    //       page: page,
    //       task: task,
    //       chatApi: chatApi,
    //       outputFilePath
    //     },
    //   });
    //   enqueue.assign({
    //     tasks: tasks.push(system.get(systemId))
    //   });
    //    
    //   enqueue.assign({
    //     currentTask: ({context:{tasks}})=> tasks.last
    //   });
    //
    //    
    //   enqueue.sendTo(feedback, ({system})=>({
    //     type: 'created',
    //     task: system.get(systemId)
    //   }))
    //  
    //   enqueue({ type: 'onTaskCreated', params: {task: system.get(systemId)} });
    //  
    // }),
    assignNewTask: assign({
      currentTask: ({context: {tasks, page, chatApi, outputFilePath}, event,   spawn, self}) =>
        spawn('taskMachine', {
          id: `task:${tasks.length+1}`,
          systemId: `task:${tasks.length+1}`,
          input: {
            page: page,
            task: (event as TaskEvent).task,
            chatApi: chatApi,
            outputFilePath,
            sender: self,
          },
        }),

    }),
    assignCompletedTask: assign({
      tasks: ({context: {tasks, currentTask}}) => currentTask? tasks.concat(currentTask) : tasks,
      // completedTasks: ({context: {completedTasks,currentTask}, _} ) => completedTasks.push(currentTask),
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
    tasks: [],
    messages: []
  }),
  initial: 'loading',
  states: {
    loading: {
      always: [{
        guard: 'pageReady',
        target: 'ready',
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
          target: 'ready',
          actions: 'assignPage',
        }
      }
    },
      ready: {
        on: {
          task: {
            target: 'task',
            actions: 'assignNewTask'
          },
          'task.done': {
            actions: 'assignCompletedTask',
          },
        }
      },
      task: {
        on: {
          'task.done': {
            actions: 'assignCompletedTask',
            target: 'ready' 
          }
        }
      } 
  }
});

export type PageMachine = typeof pageMachine;
export type PageMachineOutput = OutputFrom<PageMachine>;
 export type PageMachineContext = ContextFrom<PageMachine>;
export type PageMachineEvent = EventFrom<PageMachine>;
export type PageMachineState = StateFrom<PageMachine>
export type PageMachineActor = ActorRefFrom<PageMachine>;
export type  PageServiceSnapshot = ReturnType<PageMachineActor["getSnapshot"]>;
// export  function sendTask(this:PageMachineActor, task: string) {
//   return new Promise((resolve, reject) => {
//     if(this.getSnapshot().matches('ready')) {
//       this.subscribe((state) => {
//         if (state.matches('task')) {
//           resolve(state.context.currentTask);
//         }
//       })
//       this.send( {type: 'task', task: task, feedback: resolve});
//
//     }
//   
//   })
// }