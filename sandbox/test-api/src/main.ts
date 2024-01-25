import {ServerWebSocket} from 'bun';
import { parseArgs } from "node:util";
 

const {
  values:{
    port,
    host
  },
  positionals,
} = parseArgs({
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
  async fetch(request: Request): Promise<Response> {
    return new Response('Hello World!');
  },
});

console.log(`running on port http://${host}:${port}`);
