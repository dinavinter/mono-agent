import {ActionFunctionArgs, redirect} from '@remix-run/node';
import {
  PageServiceSnapshot, TaskMachineActor,
} from '@mono-agent/browser';
import {useLocation, Form, useParams, Outlet, Link, NavLink} from '@remix-run/react';
import { useEffect, useRef } from "react";
import {webService} from '~/services/system.ts';
import { eventStream } from 'remix-utils/sse/server';
import {useEventSourceBatch} from '~/services/eventSource.ts';
  
 export async function action({ request }: ActionFunctionArgs) {
   const formData = await request.formData();

   const url = formData.get("url") as string;
   webService.send({type: "page", url});
  
   return redirect(`/chat/${url}`, {
     headers: {
       "Set-Cookie": `systemId=${url}; Path=/; HttpOnly`
     }


   });
 }
 
 
 export async function loader({request}: ActionFunctionArgs) {
   const {page} = useParams(); 
     return eventStream(request.signal, function setup(send) {
     const subscription= webService.system.get(page).subscribe(function({context:{tasks}, event: {}}: PageServiceSnapshot) {
       send({ data: JSON.stringify(tasks.map((task: TaskMachineActor) => {
           return task.id;
         })) });
     })

     return function cleanup() {
       subscription.unsubscribe();
     };
   })
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
 