import {Form, Link, Outlet} from '@remix-run/react';
import {ActionFunctionArgs, LoaderFunctionArgs, redirect} from '@remix-run/node';
import {PageMachineActor, type WebChatServiceSnapshot} from '@mono-agent/browser';
import {webService} from '~/services/system.ts';
import {eventStream} from 'remix-utils/sse/server';
import {useEffect, useRef, useState} from 'react';
import {useEventSource} from 'remix-utils/sse/react';
 
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const url = formData.get("url") as string;
  webService.send({type: "page", url});
  
  return redirect(`chat/${url}`)
  
}

export async function loader({
                               request,
                             }: LoaderFunctionArgs) {
  return eventStream(request.signal, function setup(send) {
    const subscription= webService.subscribe(function({context:{pages}, event: {}}: WebChatServiceSnapshot) {
      send({ data: JSON.stringify(pages.map((page: PageMachineActor) => {
          return page.id;
        })) });
    })

    return function cleanup() {
      subscription.unsubscribe();
    };
  });
}

export function Pages() {
  const [pages, setPages] = useState<string[]>([]);
  const lastPage = useEventSource(`/`, {});
  const $form = useRef<HTMLFormElement>(null);

  useEffect(
    function saveMessage() {
      setPages((current) => {
        if (typeof lastPage === "string") return current.concat(lastPage);
        return current;
      });
    },
    [lastPage],
  );

  return (<>
      <div id="sidebar">
        <ul>
          {pages.map((page) => (
            <li key={page}>
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

