'use client';

import { useEffect, useRef } from 'react';
import type { Message as OllamaMessage } from 'ollama';
import Message from '@/components/Message';

type ChatMessage = Pick<OllamaMessage, 'role' | 'content'>;

type Props = { messages: ChatMessage[]; loading: boolean };

const MessageList = ({ messages, loading }: Props) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="empty-state">
        <h2>What can I help you find?</h2>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <Message
          key={`${index}-${message.role}`}
          message={message}
          pending={loading && index === messages.length - 1}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
};

export default MessageList;
