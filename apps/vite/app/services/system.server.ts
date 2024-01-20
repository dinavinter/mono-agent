import {emitter} from '~/services/emitter.ts';
 import {
   WebChatMachine,
} from '@mono-agent/tester';

import type{
  AnyStateMachine,
  AnyActor,
  SnapshotFrom,
  AnyActorRef,
} from 'xstate';
import {createActor} from 'xstate';
import {createFileSessionStorage} from '@remix-run/node';
import {createCookie} from '@vercel/remix';

const sessionCookie = createCookie('__session', {
  secrets: ['r3m1xr0ck5'],
  sameSite: true,
});

const {getSession, commitSession, destroySession} =
  createFileSessionStorage({
    // The root directory where you want to store the files.
    // Make sure it's writable!
    dir: '/app/sessions',
    cookie: sessionCookie,
  });


export async function hydrateWithLocalStorage(machine: AnyStateMachine) {
  // Get the state from localStorage (if it exists)
  const session = await getSession(
    sessionCookie.name,
  );

  
    const stateString = session.has(machine.id) ? session.get(machine.id) :undefined;

   // Create the state from the string (if it exists)
   const restoredState = stateString ? JSON.parse(stateString) : undefined;

   const actor = createActor(machine, {
     // Restore the state (if it exists)
     snapshot: restoredState,
   });

   session.set(actor.id, JSON.stringify(actor.getPersistedSnapshot()));

   // Subscribe to the actor 
   actor.subscribe(() => {
     // Persist the state to localStorage
     const persistedState = actor.getPersistedSnapshot();
     sessionStorage.setItem(machine.id, JSON.stringify(persistedState));
   });
   
   return actor;
 
}

export function hydrateWithEmitters<TActor extends  AnyActor,  TSnapshot = SnapshotFrom<TActor>>(service: TActor) {
  service.subscribe(function(snapshot: TSnapshot) {
    emitter.emit(service.id, {data: snapshot});
  });
  return service;
}
   

const service = await hydrateWithLocalStorage(WebChatMachine);
 service.start();

export const webService= service;