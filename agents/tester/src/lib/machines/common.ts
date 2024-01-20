import  {ChatOpenAI} from 'langchain/chat_models/openai';
import type {BaseChatModel} from 'langchain/chat_models/base';


import type{
  ActorRef, AnyActorRef,
  EventObject,
  MachineContext,
  ProvidedActor,  StateValue,Spawner, MachineSnapshot
} from 'xstate';

// export type BaseChatModel  =any;

export type ChatModelLike = {
  
}

export type BaseContext = {
  chatApi?: ChatModelLike
  llm?: ChatModelLike
  outputFilePath: string

} & MachineContext


export type BaseInput = {
  chatApi?: ChatModelLike
  llm?: ChatModelLike
  outputFilePath: string


}

export type ItemWithId<TItem, TIdField extends string = "id", TIdType = number>=  TItem &    {
   [P in TIdField]: TIdType;
}

export function entitySet <TItem, TIdField extends string = "id", TIdType = number>(field:TIdField ="id" as TIdField ){
  const items= [] as ItemWithId<TItem, TIdField, TIdType> & any[];
   
  const set ={
    items: items,
    push(item: ItemWithId<TItem, TIdField, TIdType>) {
      this.items.push(item);
      return this;
    },
    add(item: TItem){
      const id = this.autoIncrementId.next();
      return this.push({...item, [field]: id})  
    },
    
    removeAt(id: TIdType){
      this.items = this.items.filter((i: TItem & { [P in TIdField]: TIdType }) => i[field] !== id);
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

// export function contextFactoryWithFactory<TInput extends Partial<TContext>, TContext extends BaseContext= BaseContext>(factory:ContextFactoryBase){
//   return factoryFn;
//   function factoryFn({input, ...more}: {input: TInput } & any) {
//     const enrich = factory({input, ...more});
//     return  contextFactory({input: { ...input, ...enrich},  ...more});
//
//   }
// }

// type InputFromSetup<TSetup extends SetupTypes<any, any, any, any, any, any> >= TSetup extends SetupTypes<infer TContext, infer TEvent, infer TChildrenMap, infer TTag, infer TInput, infer TOutput> ? TInput : never;
 