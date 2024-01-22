import {LoaderFunctionArgs} from '@remix-run/node';
import {webService} from '~/services/system.server.ts';
import type {PageMachineActor, WebChatServiceSnapshot} from '@mono-agent/tester';
import { eventStream } from 'remix-utils/sse/server';

export async function loader({
                               request,
                             }: LoaderFunctionArgs) {
   return eventStream(request.signal, function setup(send) {
    const subscription= webService.subscribe(function({context:{pages}}: WebChatServiceSnapshot) {
      send({ data: JSON.stringify(pages.map((page: PageMachineActor) => {
          return page.id;
        })) });
    })

    return function cleanup() {
      subscription.unsubscribe();
    };
  });
}