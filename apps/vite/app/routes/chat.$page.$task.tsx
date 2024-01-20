import {ActionFunctionArgs} from '@remix-run/node';
import { eventStream } from "remix-utils/sse/server";

import {useParams} from '@remix-run/react';
import type {TaskMachineEvent, TaskServiceSnapshot} from '@mono-agent/tester';
import {useEventSourceBatchJson} from '~/services/eventSource.ts';

export async function loader({request}: ActionFunctionArgs) {
  const   {webService} = await import('~/services/system.server');

  const {task} = useParams();
  return eventStream(request.signal, function setup(send) {
    const subscription= webService.system.get(task!).subscribe(function(snapshot: TaskServiceSnapshot) {
       send({ data: JSON.stringify( snapshot)});
    })

    return function cleanup() {
      subscription.unsubscribe();
    };
  })
}

export default function Index() {
    const events = useEventSourceBatchJson('/')as {event: TaskMachineEvent}[] ;
    
    
    return (
      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        {events.length > 0
            ? events.map(({event})=>event).map((m: TaskMachineEvent) => (
              <div
                key={m.id}
            className="whitespace-pre-wrap"
            style={{ maxWidth: '80%' }} 
          >  
            <strong>{`${m.type}: `}</strong>
             ${JSON.stringify(m)}
            <br />
            <br />
              </div>
          )):undefined}
        </div>
    );
    
    
}
 

 
