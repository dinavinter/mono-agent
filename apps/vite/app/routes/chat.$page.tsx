import {ActionFunctionArgs} from '@remix-run/node';
import type {
  PageMachineActor,
  PageServiceSnapshot, TaskMachineActor,
} from '@mono-agent/tester';
import {useLocation, Form, useParams, Outlet, NavLink, json} from '@remix-run/react';
import { useEffect, useRef } from "react";
import { eventStream } from 'remix-utils/sse/server';
import {useEventSourceBatch} from '~/services/eventSource.ts';
import { serverOnly$ } from 'vite-env-only';
  
 export async function action({ request }: ActionFunctionArgs) {
   const   {webService} = await import('~/services/system.server');

   const {page} = useParams();
   const service = webService.system.get(page!) as PageMachineActor;
   const formData = await request.formData();
   const task = formData.get("task") as string;
   service.send({type: "task", task});
    
   
   let promise = new Promise<{task: TaskMachineActor, id:string, href:string}>((resolve) => {
   service.subscribe(
      function({context:{currentTask} }: PageServiceSnapshot) {
        if(currentTask) {
               resolve({
                 task: currentTask,
                 id: currentTask.id,
                 href: `/${page}/${currentTask.id}`,
               });
      
        }
      }
   )}
   );
    const {task:taskActor, href, id} = await promise;
   return json({ 
     message: "task created",
     id, href,
     data: taskActor.getPersistedSnapshot(),
     links:{
      self: `/${page}`,
      task: href
     } }, {
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
        "Location": href,
        "X-Remix-Run-Location": href,
        "X-System-Id": id,
      },
   });
 }
 
 
 export async function loader({request}: ActionFunctionArgs) {
   const   {webService} = await import('~/services/system.server');

   const {page} = useParams();
   return serverOnly$( eventStream(request.signal, function setup(send) {
     const subscription = webService.system.get(page!).subscribe(function({context: {currentTask}}: PageServiceSnapshot) {
       if (currentTask)
         send({data: currentTask.id});
     })

     return function cleanup() {
       subscription.unsubscribe();
     };
   }))
 }
 

   export default function Component() {
      const $form = useRef<HTMLFormElement>(null);
     const {key} = useLocation();
     useEffect(
       function clearFormOnSubmit() {
         $form.current?.reset();
       },
       [key],
     );

     const tasks =useEventSourceBatch(`/`);
     return (<>
         <div id="sidebar">
           <ul>
             {tasks.map((task) => (
               <li key={task}>
                 <NavLink
                   className={({ isActive, isPending }) =>
                     isActive
                       ? "active"
                       : isPending
                         ? "pending"
                         : ""
                   }
                   to={`${task}`}
                 >
                   {/* existing elements */}
                 </NavLink>

               </li>
             ))}
           </ul>
         
         </div>
         <div id="actions">
           <Form ref={$form} method="post" >
             <label>Task</label>
             <input type="text" name="task" />
             <button>Send</button>
           </Form>
         </div>
         <div id="detail">
           <Outlet />
         </div>

        

       </>
     );
   }
 