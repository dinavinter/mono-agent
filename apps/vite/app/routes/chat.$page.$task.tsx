import {ActionFunctionArgs, LoaderFunctionArgs} from '@remix-run/node';
import { eventStream } from "remix-utils/sse/server";

import {useParams, useSearchParams} from '@remix-run/react';
import {webService} from '~/services/system.ts';
import {TaskMachineEvent, TaskServiceSnapshot} from '@mono-agent/browser';
import { useEventSource } from 'remix-utils/sse/react';
import {useEventSourceBatchJson} from '~/services/eventSource.ts';
import type {Message} from 'ai/react';

export async function loader({request}: ActionFunctionArgs) {
  const {task} = useParams();
  return eventStream(request.signal, function setup(send) {
    const subscription= webService.system.get(task).subscribe(function({context, event, state}: TaskServiceSnapshot) {
       send({ data: JSON.stringify({context, event, state:state.value}) } ) ;
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
 

 
