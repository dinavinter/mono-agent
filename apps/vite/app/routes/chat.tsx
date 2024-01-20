import {Form, Link, NavLink, Outlet} from '@remix-run/react';
import {ActionFunctionArgs, LoaderFunctionArgs, redirect} from '@remix-run/node';
import type {PageMachineActor, WebChatServiceSnapshot} from '@mono-agent/tester';
import {eventStream} from 'remix-utils/sse/server';
import {useRef} from 'react';
import {useEventSourceJson} from '~/services/eventSource.ts';


import { serverOnly$ } from "vite-env-only";

 

export async function loader({
                               request,
                             }: LoaderFunctionArgs) {
  const   {webService} = await import('~/services/system.server');

  return eventStream(request.signal, function setup(send) {

     const subscription= webService.subscribe(function({context:{pages}}: WebChatServiceSnapshot) {
       send({ data: JSON.stringify(pages.items.map((page: PageMachineActor) => {
            return page.id;
         })) });
     })  
 
    return function cleanup() {
      subscription.unsubscribe();
    };
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const   {webService} = await import('~/services/system.server');
  const url = formData.get("url") as string;
  webService.send({type: "page", url});
  return redirect(`/chat/${url}`)

}

 

export default function Pages() {
  const $form = useRef<HTMLFormElement>(null);
  const pages =useEventSourceJson<string[]>(`/`) 
  

  return (<>
    <div id="sidebar">
      <ul>
        {pages.map((page) => (
          <li key={page}>
            <NavLink
              className={({ isActive, isPending }) =>
                isActive
                  ? "active"
                  : isPending
                    ? "pending"
                    : ""
              }
              to={`${page}`}
            >
              {page}
             </NavLink>

            <Link to={`/${page}`}>${page}</Link>
          </li>
        ))}
      </ul> 
    </div>
  <div id="actions">
    <Form ref={$form} method="post" >
      <label>Url</label>
      <input type="text" name="url" />
      <button>Send</button>
    </Form>
  </div>
  <div id="detail">
    <Outlet />
  </div>



</>
  );
}

