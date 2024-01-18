import {
  ActorRefFrom,
  AnyActorRef,
  assign,
  ContextFrom,
  EventFrom,
  fromPromise,
  OutputFrom,
  setup, SnapshotFrom,
  StateFrom,
} from 'xstate';
import {Page} from 'playwright';
import {BaseChatModel} from 'langchain/dist/chat_models/base';
import {ContextFactory, SetupTypes} from 'xstate/dist/declarations/src/types';
import {appendToTestFileAsync, formatCode} from '../util';
import {execPlayWrightCode, getPlayWrightCode} from '../actions/interactWithPage';
import {BaseContext, contextFactory} from './common';


export type TaskMachine = ReturnType<typeof taskMachineSetup.createMachine>;
export type TaskMachineActor = ActorRefFrom<TaskMachine>

export const taskMachineSetup =  setup({


  types: {
    input: {} as {
      page: Page,
      task: string,
      sender?: AnyActorRef,
      outputFilePath: string
    } & BaseContext,
    output:{} as {
      steps: string[] ,
      code: string,
      error: any
    },
    context: {} as {
      task: string,
      page: Page,
      code: string,
      codes: Array<string>,
      error: string,
      errors: Array<string>,
      outputFilePath: string
    } & BaseContext,


  },

  actions: {
    assignCode: assign({
      code: ({event}) => event.output,
      codes: ({context:{codes}, event:{output}}) => [...codes, output],
    }),
    assignError: assign({
      errors: ({context:{errors}, event:{error}}) => {
        return errors.concat(error)
      },
      error: ({event:{error}}) => error
    })
  }
})


type InferContextFactory<TSetup extends SetupTypes<any, any, any, any, any, any> >= TSetup extends SetupTypes<infer TContext, infer TEvent, infer TChildrenMap, infer TTag, infer TInput, infer TOutput> ? ContextFactory<TContext, any, TInput, TEvent> : never;

export const taskMachine:TaskMachine = taskMachineSetup.createMachine({
  context: contextFactory,
  initial: 'generate-code',
  states: {
    'generate-code': {
      invoke: {
        id: 'generate-code',
        src: 'getPlayWrightCode',
        input: ({context}) => ({
          page: context.page,
          chatApi: context.chatApi,
          task: context.task
        }),
        onDone: {
          target: 'execute-code',
          actions: 'assignCode',
        },
        onError: {actions: 'assignError'}
      }
    },
    'execute-code': {
      invoke: {
        id: 'execute-code',
        src: 'executeCode',
        onDone: {
          target: 'save-code-to-file',
          actions: 'assignCode',
        },
        onError: {actions: 'assignError'}
      }
    },
    'save-code-to-file': {
      invoke: {
        id: 'save-code-to-file',
        src: 'saveCodeToFile',
        onDone: {
          target: 'ready',
          actions: 'assignCode',
        },
        onError: {actions: 'assignError'}
      }
    },
    ready: {
      type: 'final',
      tags: ['success']
    },
    error: {
      type: 'final',
      tags: ['error']
    }
  },
  output: ({context}) =>  {
    return {
      steps: context.codes,
      code: formatCode({
        code: context.code,
        task: context.task
      }),
      error: context.error
    }},
}).provide({
  actors: {
    getPlayWrightCode: fromPromise(({input: {page,task, chatApi}}) => getPlayWrightCode(page, chatApi, task)),
    executeCode: fromPromise(({input: {page, code}}  ) => execPlayWrightCode(page, code)),
    saveCodeToFile: fromPromise(({input: { outputFilePath, code, task} } ) => appendToTestFileAsync({task,code, outputFilePath})),
  }
});


export type TaskMachineMachineOutput = OutputFrom<TaskMachine>;
export type TaskMachineContext = ContextFrom<TaskMachine>;
export type TaskMachineEvent = EventFrom<TaskMachine>;
export type TaskMachineState = StateFrom<TaskMachine>
 export type  TaskServiceSnapshot = SnapshotFrom<TaskMachine>
export type TaskMachineEvents = TaskMachineEvent['type'];