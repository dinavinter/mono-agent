import {createWebChatService, WebChatMachine, WebChatService, type WebChatServiceSnapshot} from '@mono-agent/tester';

const  history= new Map<string, WebChatServiceSnapshot>();


async function saveSnapshot() {
  try {
    await Bun.write(`./build/${webChatService.id}.snapshot.json`,
      JSON.stringify(webChatService.getPersistedSnapshot(), null, 2)
      , {
        createPath: true,
      });
  }
  catch (error) {
    console.error(`service:${webChatService.id}:error`, error);
  }
  finally {
    console.log(`service:${webChatService.id}:snapshot saved at ./build/${webChatService.id}.snapshot.json`);
  }
}

export const webChatService:WebChatService =  createWebChatService({
  snapshot: history.get(WebChatMachine.id),
  inspect: {
    next(state:any) {
      if (state.type === '@xstate.snapshot') {
        history.set(WebChatMachine.id, state);
      }
     },
    error(error:any) {
      console.error(`service:${webChatService.id}:error`, error);
      saveSnapshot().then(r => console.log(r));
    }

  },
  input: {
  }
})
 
 export default webChatService;