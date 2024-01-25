import {createWebChatService, WebChatMachine} from '@mono-agent/tester';

import {createFileSessionStorage} from '@remix-run/node';
import {createCookie} from '@vercel/remix';

const sessionCookie = createCookie('__web-chat_session', {
  secrets: ['r3m1xr0ck5'],
  sameSite: true,
});

const {getSession} =
  createFileSessionStorage({
    // The root directory where you want to store the files.
    // Make sure it's writable!
    dir: '/app/sessions',
    cookie: sessionCookie,
  });


export async function hydrateSessionStorage() {
  const machine = WebChatMachine;
  const session = await getSession(
    sessionCookie.name,
  );

  const service =  createWebChatService({
    snapshot: session.get(machine.id),
    inspect: {
      next(state:any) {
        if (state.type === '@xstate.snapshot') {
          session.set(machine.id, state);
        }
        console.log('next', state);
      },
      error(state:any) {
        console.error('error', state);
      }

    }
  })
   service.start();

   return service;
 
}

    


export const webService= await hydrateSessionStorage();