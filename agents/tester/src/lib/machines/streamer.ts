import {AnyActorRef, AnyEventObject, createMachine, forwardTo, fromCallback, fromTransition, spawnChild} from 'xstate';
import {pipeToReadableCallback} from '../streaming/stream';
import {ReadableStream} from 'node:stream/web';

type StreamerContext = {
  actor: AnyActorRef,
  readable: ReadableStream<AnyEventObject>,
  writable: WritableStream<AnyEventObject>
}
export const StreamerMachine = createMachine({
  id: 'streamer',
  initial: 'idle',
  context: ({actor, readable, writable}: {actor:AnyActorRef, readable?: ReadableStream<AnyEventObject>, writable?:WritableStream<AnyEventObject>})=>({
     actor: actor,
     readable: readable || new ReadableStream<AnyEventObject>(),
     writable: writable || new WritableStream<AnyEventObject>(),
  } as StreamerContext),
  invoke: [{
    id: 'stream',
    src: pipeToReadableCallback,
    systemId: 'streamer',
    input: ({context:{readable, writable}}:{context:StreamerContext}) => ({
      readable: readable,
      writable: writable
    } )
  },{
    id:'actor',
    src:  fromCallback(({sendBack, receive, input:{actor}}) => {
      receive((event: AnyEventObject) => {
        actor.send(event);
      })
      actor.onDone((event: AnyEventObject) => {
        sendBack(event);
      })
      actor.onError((event: AnyEventObject) => {
        sendBack(event);
      })
      return () => {
        actor.stop();
      };
    }),
    input: ({context:{actor}}:{context:StreamerContext}) => ({
      actor: actor
    } )
  }]
   
  
});

 