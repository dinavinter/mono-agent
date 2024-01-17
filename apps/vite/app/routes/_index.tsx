import type { MetaFunction } from "@remix-run/node";
import {type Message, useChat} from "ai/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Agent Chat" },
    { name: "description", content: "Welcome Chat with Agents!" },
  ];
};

export default function Index() {
  const { messages, input, handleInputChange, handleSubmit, setInput} = useChat({
    id: "aa",
    api: '/chat'
  });


  // Generate a map of message role to text color
  const roleToColorMap: Record<Message['role'], string> = {
    system: 'red',
    user: 'black',
    function: 'blue',
    assistant: 'green',
    data: 'black',
    tool: 'gray'
  };

  return (
      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        {messages.length > 0
            ? messages.map((m: Message) => (
                <div
                    key={m.id}
                    className="whitespace-pre-wrap"
                    style={{ color: roleToColorMap[m.role] }}
                >
                  <strong>{`${m.role}: `}</strong>
                  {m.content || JSON.stringify(m.function_call)}
                  <br />
                  <br />
                </div>
            ))
            : null}
        <div id="chart-goes-here"></div>
        <form method="post" action={"/chat"} onSubmit={handleSubmit}>


          <input
              className="fixed bottom-1 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
              value={input}
              placeholder="Say something..."
              onChange={handleInputChange}
          />
        </form>


        <button className={ "fixed bottom-0  w-full rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 "} aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label" onClick={() => {
          setInput(
              'test register flow at https://gigya.login.dynidp.com/pages/login'

          );
        }}>test register flow at https://gigya.login.dynidp.com/pages/login'
        </button>



      </div>
      );
}
