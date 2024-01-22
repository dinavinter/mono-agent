import { EventEmitter } from 'node:events';
import { fromCallback} from 'xstate';
import type {AnyEventObject, CallbackActorLogic} from 'xstate';

type EmitterInput = {emitter?:EventEmitter};
type EmitterCallback = CallbackActorLogic<AnyEventObject, EmitterInput>;

const callback:EmitterCallback= fromCallback(({ sendBack, receive, input:{emitter } }) => {
  emitter??= new EventEmitter();
  emitter.on('message', (data) => {
    sendBack({type:'message', data});
  });
  emitter.on('error', (err) => {
    sendBack({type:'error', err});
  });
  receive((event: AnyEventObject) => {
    emitter.emit(event.type, event.data);
  })
  return () => {
    emitter.removeAllListeners();
  };
});
 