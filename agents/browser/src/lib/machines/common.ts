import {BaseChatModel} from 'langchain/dist/chat_models/base';
import {ChatOpenAI} from 'langchain/chat_models/openai';
import {
  ActorRef, AnyActorRef,
  ContextFactory,
  EventObject,
  MachineContext,
  ProvidedActor,
  SetupTypes, StateValue,
} from 'xstate/dist/declarations/src/types';
import {Spawner} from 'xstate/dist/declarations/src/spawn';
import type {MachineSnapshot} from 'xstate/dist/declarations/src/State';

export type BaseContext = {
  chatApi?: BaseChatModel
  llm?: BaseChatModel
  outputFilePath: string

} & MachineContext


export type BaseInput = {
  chatApi?: BaseChatModel
  llm?: BaseChatModel

}

export type ItemWithId<TItem, TIdField extends string = "id", TIdType = number>=  TItem &    {
   [P in TIdField]: TIdType;
}

export function entitySet <TItem, TIdField extends string = "id", TIdType = number>(field:TIdField ="id" as TIdField ){
  const items= [] as ItemWithId<TItem, TIdField, TIdType>[];
  const id =0;
  
  const set ={
    items: items,
    push(item: TItem) {
      this.items.push(item);
      return this;
    },
    add(item: TItem){
      const id = this.autoIncrementId.next();
      return this.push({...item, [field]: id})  
    },
    remove(item: TItem) {
      this.items = this.items.filter(i => i !== item);
      return this;
    },
    removeAt(id: TIdType){
      this.items = this.items.filter(i => i[field] !== id);
      return this;

    },
     get first() {
      return items[0];
    },
    get last() {
      return items.length && items[this.items.length - 1];
    },
    autoIncrementId: {
      _id: 0,
      next() {
        return this._id++;
      }

    }

  }
  set.push.bind(set);
  set.remove.bind(set);
  set.autoIncrementId.next.bind(set.autoIncrementId);

  return set;
}

export type EntitySet<TItem> = ReturnType<typeof entitySet<TItem>>;

type ContextFactoryBase= <TContext extends BaseContext, TActor extends ProvidedActor, TInput extends BaseInput & Partial<TContext>, TEvent extends EventObject = EventObject>  ({ spawn, input, self }: {
  spawn: Spawner<TActor>;
  input: TInput;
  self: ActorRef<MachineSnapshot<TContext, TEvent, Record<string, AnyActorRef | undefined>, // TODO: this should be replaced with `TChildren`
    StateValue, string, unknown>, TEvent>;
}) => TContext & any
 
export const contextFactory : <TContext extends BaseContext, TActor extends ProvidedActor, TInput extends BaseInput & Partial<TContext>, TEvent extends EventObject = EventObject>  ({ spawn, input, self }: {
  spawn: Spawner<TActor>;
  input: TInput;
  self: ActorRef<MachineSnapshot<TContext, TEvent, Record<string, AnyActorRef | undefined>, // TODO: this should be replaced with `TChildren`
    StateValue, string, unknown>, TEvent>;
}) => TContext & any =  ({input:{chatApi,llm, ...input}})  => ({
  ...input,
  chatApi: llm || chatApi || new ChatOpenAI({
    temperature: 0.1,
    modelName: 'gpt-4-1106-preview'
  })
})  


declare type EnrichContextFactory <TInput extends Partial<TContext>, TContext extends BaseContext= BaseContext> =  TInput | ContextFactoryBase

export function contextFactoryWith <TInput extends Partial<TContext>, TContext extends BaseContext= BaseContext>(
  enrich:EnrichContextFactory<TInput,TContext >){
                                                                                                                
   return factory; 
  function factory({input, ...more}: {input: TInput } & any) { 
    return typeof enrich == "function"?
    contextFactory({input: { ...input, ...enrich({input, ...more})},  ...more}): 
       contextFactory({input: {...enrich, ...input},  ...more}) 
  
  } 
} 

export function contextFactoryWithFactory<TInput extends Partial<TContext>, TContext extends BaseContext= BaseContext>(factory:ContextFactoryBase){
  return factoryFn;
  function factoryFn({input, ...more}: {input: TInput } & any) {
    const enrich = factory({input, ...more});
    return  contextFactory({input: { ...input, ...enrich},  ...more});

  }
}

type InputFromSetup<TSetup extends SetupTypes<any, any, any, any, any, any> >= TSetup extends SetupTypes<infer TContext, infer TEvent, infer TChildrenMap, infer TTag, infer TInput, infer TOutput> ? TInput : never;
 