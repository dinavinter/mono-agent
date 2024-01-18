import {useEffect, useState} from 'react';
import { useEventSource } from "remix-utils/sse/react";

export function useEventSourceBatch(...params: Parameters<typeof useEventSource>) {
  const [messages, setMessages] = useState<string[]>([]);
  const lastMessage = useEventSource(...params);
  useEffect(
    function saveMessage() {
      setMessages((current) => {
        if (typeof lastMessage === 'string') return current.concat(lastMessage);
        return current;
      });
    },
    [lastMessage],
  );
  return messages;
}

export function useEventSourceBatchJson(...params: Parameters<typeof useEventSource>) {
  const [messages, setMessages] = useState<any[]>([]);
  const lastMessage = useEventSource(...params);
  useEffect(
    function saveMessage() {
      setMessages((current) => {
        if (typeof lastMessage === 'string') return current.concat(JSON.parse(lastMessage));
        return current;
      });
    },
    [lastMessage],
  );
  return messages;
}