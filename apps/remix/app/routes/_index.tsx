import { useChat } from 'ai/react';
import type { MetaFunction } from '@vercel/remix';

export const meta: MetaFunction = () => {
  return [
    { title: 'Mono-Agent App' },
    { name: 'description', content: 'Welcome to Mono-Agent!' },
  ];
};

// export const config = { runtime: 'edge' };


export default function Index() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
      api: "/chat"
  });
  return (
      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        {messages.length > 0
            ? messages.map(m => (
                <div key={m.id} className="whitespace-pre-wrap">
                  {m.role === 'user' ? 'User: ' : 'AI: '}
                  {m.content}
                </div>
            ))
            : null}

        <form onSubmit={handleSubmit}>
          <input
              className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
              value={input}
              placeholder="Say something..."
              onChange={handleInputChange}
          />
        </form>
      </div>
  );
}