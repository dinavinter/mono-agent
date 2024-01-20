import {emitter} from '~/services/emitter.ts';
 import {
   WebChatMachine,
} from '@mono-agent/tester';

import type{
  AnyStateMachine,
  AnyActor,
  SnapshotFrom,
} from 'xstate';
 import {createActor} from 'xstate';

 export function hydrateWithLocalStorage(machine: AnyStateMachine) {
   // Get the state from localStorage (if it exists)
   const stateString = localStorage.getItem(machine.id);

   // Create the state from the string (if it exists)
   const restoredState = stateString ? JSON.parse(stateString) : undefined;

   const actor = createActor(machine, {
     // Restore the state (if it exists)
     snapshot: restoredState,
   });

   localStorage.setItem(service.id, JSON.stringify(actor.getPersistedSnapshot()));

   // Subscribe to the actor 
   actor.subscribe(() => {
     // Persist the state to localStorage
     const persistedState = actor.getPersistedSnapshot();
     localStorage.setItem(machine.id, JSON.stringify(persistedState));
   });
   
   return actor;
 
}

export function hydrateWithEmitters<TActor extends  AnyActor,  TSnapshot = SnapshotFrom<TActor>>(service: TActor) {
  service.subscribe(function(snapshot: TSnapshot) {
    emitter.emit(service.id, {data: snapshot});
  });
  return service;
}
   

const service = hydrateWithLocalStorage(WebChatMachine);
await service.start();

export const webService= service;