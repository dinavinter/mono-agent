import { ServerWebSocket} from 'bun';
import { parseArgs } from "util";
 

console.log(Bun.argv);

const {
  values:{
    port,
    host
  },
  positionals,
} =  parseArgs({
  args: Bun.argv,
  allowPositionals: true,
  options: {
    port: {
      type: 'string',
      short: 'p',
      default:`${Bun.env.PORT || 7070}`
     },
    host: {
      short: 'h',
      type: 'string',
      default: 'localhost',
    }
  }
});
 
Bun.serve({
  port: port,
  websocket: {
    open: async (ws: ServerWebSocket<unknown>) => {
      console.log('websocket:open', ws);
      
      ws.publishText('connection', 'Hello!')
    },
    message: function(ws: ServerWebSocket<unknown>, message: string | Buffer): void | Promise<void> {
      console.log('websocket:message', message);
    },
  },
  async fetch(request: Request): Promise<Response> {
    return new Response('Hello World!');
  },
});

console.log(`running on port http://${host}:${port}`);
