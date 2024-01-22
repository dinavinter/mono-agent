import stream, {pipeline} from 'node:stream';
 
import type {ActorScope, EventObject,   ActorSystem,
  AnyActorRef,
  AnyEventObject, CallbackActorLogic, ContextFrom, EventFrom, fromObservable,
  NonReducibleUnknown, Subscription,
  TransitionActorLogic,
  TransitionSnapshot,} from 'xstate';
import {fromCallback, toPromise} from 'xstate';
import {ReadableStream} from 'node:stream/web';
 
type StreamerInput = {
  readable?: ReadableStream<AnyEventObject>;
  writable?: WritableStream<AnyEventObject>;
  transform?: TransformStream;
   
};
type AnyActorSystem = ActorSystem<any>;
type StreamerService = CallbackActorLogic<AnyEventObject, StreamerInput>;

function getInvokeCallback<TEvent extends EventObject, TInput extends StreamerInput= StreamerInput>():InvokeCallback<TEvent, TInput> {
   return ({sendBack, receive, self, input:{readable, writable}}) => {
     const r = new ReadableStream<TEvent>({
      async start(controller) {
        receive(function(event) {
          controller.enqueue(event);
        });

        toPromise(self)
          .then(() => controller.close())
          .catch((error) => controller.error(error));

      },
      async cancel(reason) {
        console.log('cancel', reason)

        // sendBack({type: 'cancel', reason});
      },
    });

    const w = new WritableStream<TEvent>({
      write(chunk) {
        sendBack(chunk);
      },
      async close() {
        console.log('close')
        // sendBack({type: 'done'});
      },
      async abort(reason) {
        console.log('abort', reason) 
        // sendBack({type: 'error', data: reason});
      },
    });
    
     if(readable){
       readable.pipeTo(w);
     }
      if(writable){
        r.pipeTo(writable);
      }
     

   };
}

type InvokeCallback<TEvent extends EventObject, TInput>  = Parameters<typeof fromCallback<TEvent,TInput>>[0];

function pipeToReadable<TEvent extends EventObject, TInput extends Pick<StreamerInput,"readable">= StreamerInput>():InvokeCallback<TEvent, TInput> {
 
  return ({sendBack, receive, self, input:{readable}}) => {
      
    const writableStream = createWritableStream<TEvent>(event => sendBack(event));
    readable.pipeTo(writableStream)
      .then(() => console.log('pipeToReadable done'))
      .catch((error) => console.error('pipeToReadable error', error))
 
  };
  
}


export function machineToWritableStream< TActor extends AnyActorRef, TEvent = EventFrom<TActor>, TContext = ContextFrom<TActor>>(actor: TActor):WritableStream<TEvent> {
  return createWritableStream(event => actor.send(event));
}

export function machineToReadableStream< TActor extends AnyActorRef, TEvent = EventFrom<TActor>, TContext = ContextFrom<TActor>>(actor: TActor):ReadableStream<TEvent> {
  return createReadableStream(listener => actor.subscribe(listener), toPromise(actor));
}

function createWritableStream<TEvent>(sendBack:(event: TEvent) => void) {
  return new WritableStream<TEvent>({
    write(chunk) {
      sendBack(chunk);
    },
    async close() {
      console.log('close');
      // sendBack({type: 'done'});
    },
    async abort(reason) {
      console.log('abort', reason);
      // sendBack({type: 'error', data: reason});
    },
  });
}

function createReadableStream<TEvent>(receive: (listener:(event: TEvent) => void) => void, until?:Promise<any> ) {
  return new ReadableStream<TEvent>({
    async start(controller) {
      receive(function(event) {
        controller.enqueue(event);
        
      });

      until
        ?.then(() => controller.close())
        .catch((error) => controller.error(error));

    },
    async cancel(reason) {
      console.log('cancel', reason);

      // sendBack({type: 'cancel', reason});
    },
  });
}

 
function pipeToWritable<TEvent extends EventObject, TInput extends Pick<StreamerInput,"writable">= StreamerInput>():InvokeCallback<TEvent, TInput> {

  return ({sendBack, receive, self, input:{writable}}) => {
    const readableStream = createReadableStream(receive, toPromise(self));
    readableStream.pipeTo(writable)
      .then(() => console.log('pipeToWritable done'))
      .catch((error) => console.error('pipeToWritable error', error))

  };
  
}

const callback:StreamerService = fromCallback(  getInvokeCallback())

export const pipeToReadableCallback:StreamerService = fromCallback(pipeToReadable())
export const pipeToWritableCallback:StreamerService = fromCallback(pipeToWritable())


 function toDuplex(actor: AnyActorRef) {
   return stream.Duplex.from({
     readable:toReadable(actor), 
     writable:toWritable(actor)
   });
  }
 
 function toReadable(actor: AnyActorRef) {
    const ac = new AbortController();
    toPromise(actor).then(()=>ac.abort()).catch(()=>ac.abort());
    
    return  new stream.Readable({
      objectMode: true,
      autoDestroy: true,
      signal: ac.signal, 
      read(size) {
        this.push(actor.getSnapshot().value);
      }  
    });
  }
  
 
  
  
  function toWritable(actor: AnyActorRef, options?: stream.WritableOptions){
    const ac = new AbortController();
    toPromise(actor).then(()=>ac.abort()).catch(()=>ac.abort());
    
    return  new stream.Writable({
      objectMode: true,
      autoDestroy: true,
      signal: ac.signal, 
      ...(options || {}), 
      write(chunk, encoding, callback) {
        actor.send(chunk); 
        callback();
      }  
    });
  }
  
  function toTransform(actor: AnyActorRef, options?: stream.TransformOptions){
    const ac = new AbortController();

    return  new stream.Transform({
      objectMode: true,
      autoDestroy: true,
      signal: ac.signal,
      ...(options || {}), 
      transform(chunk, encoding, callback) {
        actor.send(chunk);
        
        callback(actor.getSnapshot().error,{
          context: actor.getSnapshot().context,
          event: actor.getSnapshot().event,
          value: actor.getSnapshot().value
        });
      } 
    });
  } 


      /**
       * Returns actor logic given a transition function and its initial state.
       *
       * A “transition function” is a function that takes the current `state` and received `event` object as arguments, and returns the next state, similar to a reducer.
       *
       * Actors created from transition logic (“transition actors”) can:
       *
       * - Receive events
       * - Emit snapshots of its state
       *
       * The transition function’s `state` is used as its transition actor’s `context`.
       *
       * Note that the "state" for a transition function is provided by the initial state argument, and is not the same as the State object of an actor or a state within a machine configuration.
       *
       * @param transition The transition function used to describe the transition logic. It should return the next state given the current state and event. It receives the following arguments:
       * - `state` - the current state.
       * - `event` - the received event.
       * - `actorScope` - the actor scope object, with properties like `self` and `system`.
       * @param initialContext The initial state of the transition function, either an object representing the state, or a function which returns a state object. If a function, it will receive as its only argument an object with the following properties:
       * - `input` - the `input` provided to its parent transition actor.
       * - `self` - a reference to its parent transition actor.
       * @see {@link https://stately.ai/docs/input | Input docs} for more information about how input is passed
       * @returns Actor logic
       *
       * @example
       * ```ts
       * const transitionLogic = fromTransition(
       *   (state, event) => {
       *     if (event.type === 'increment') {
       *       return {
       *         ...state,
       *         count: state.count + 1,
       *       };
       *     }
       *     return state;
       *   },
       *   { count: 0 },
       * );
       *
       * const transitionActor = createActor(transitionLogic);
       * transitionActor.subscribe((snapshot) => {
       *   console.log(snapshot);
       * });
       * transitionActor.start();
       * // => {
       * //   status: 'active',
       * //   context: { count: 0 },
       * //   ...
       * // }
       *
       * transitionActor.send({ type: 'increment' });
       * // => {
       * //   status: 'active',
       * //   context: { count: 1 },
       * //   ...
       * // }
       * ```
       */
      // export declare function fromTransition<TContext, TEvent extends EventObject, TSystem extends AnyActorSystem, TInput extends NonReducibleUnknown>(transition: (snapshot: TContext, event: TEvent, actorScope: ActorScope<TransitionSnapshot<TContext>, TEvent, TSystem>) => TContext, initialContext: TContext | (({ input, self }: {
      //   input: TInput;
      //   self: TransitionActorRef<TContext, TEvent>;
      // }) => TContext)): TransitionActorLogic<TContext, TEvent, TInput>;
      type StreamTransitionInput<TEvent extends AnyEventObject = AnyEventObject> = {
        where?: (event: TEvent) => boolean; 
        signal?: AbortSignal; 
      } & NonReducibleUnknown

      // declare function streamTransition<TContext, TEvent extends EventObject, TSystem extends AnyActorSystem, TInput extends StreamTransitionInput = StreamTransitionInput>(transition: (snapshot: TContext, event: TEvent, actorScope: ActorScope<TransitionSnapshot<TContext>, TEvent, TSystem>) => TContext, initialContext: TContext | (({ input, self }: {
      //   input: TInput;
      //   self: TransitionActorRef<TContext, TEvent>;
      // }) => TContext)): StreamTransitionActorLogic<TContext, TEvent, TInput>;


      type StreamTransitionActorLogic<TContext, TEvent extends AnyEventObject = AnyEventObject, TInput extends StreamTransitionInput = StreamTransitionInput> = TransitionActorLogic<TransitionSnapshot<TContext>,TEvent, TInput>;

      type PipeEvents = {
        type: 'pipe:writable';
        writable: stream.Writable;
        options?: Partial<stream.WritableOptions>;
      } | {
        type: 'pipe:readable';
        readable: stream.Readable;
        options?: Partial<stream.ReadableOptions>;
      } |{
        type: 'pipe:transform';
        transform: stream.Transform;
        options?: Partial<stream.TransformOptions>;
      }
      
      type PipeEventsWebStream = {
        type: 'pipe:writable';
        writable: WritableStream;
        options?: Partial<StreamPipeOptions>;
      } | {
        type: 'pipe:readable';
        readable: ReadableStream;
        options?: Partial<StreamPipeOptions>;
      } |{
        type: 'pipe:transform';
        options?: Partial<StreamPipeOptions>;
      }
      
       
      export function streamTransition<TContext extends {readable: ReadableStream[], subscriptions:Subscription[] }, TEvent extends PipeEventsWebStream = PipeEventsWebStream, TSystem extends AnyActorSystem = AnyActorSystem, TInput extends StreamTransitionInput = StreamTransitionInput>(state:TContext, event:TEvent, actorScope:ActorScope<TransitionSnapshot<TContext>, TEvent, TSystem>) {
        const {self} = actorScope;
        if (event.type === 'pipe:writable') {
          const readable = createReadableStream(
            function(listener) {
              state.subscriptions = state.subscriptions.concat(self.subscribe(listener));
            },
            toPromise(self));
          return {
            ...state,
            readable: [...state.readable, readable.pipeTo(event.writable)]
          };
        }
        if (event.type === 'pipe:readable') {
          const writable = createWritableStream<TEvent>(event => self.send(event));
          return {
            ...state,
            readable: [...state.readable, event.readable.pipeTo(writable)]
          };
        }
        
        return state; 


      }        
       
        
        

      
      

