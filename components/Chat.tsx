// components/Chat.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Message as OllamaMessage } from 'ollama';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';

type ChatMessage = Pick<OllamaMessage, 'role' | 'content'>;

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const history: ChatMessage[] = [
      ...messages,
      { role: 'user', content: question },
    ];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? 'Could not get an answer.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        setMessages((current) => {
          const last = current[current.length - 1];
          return [
            ...current.slice(0, -1),
            { ...last, content: last.content + chunk },
          ];
        });
      }
      const finalChunk = decoder.decode();
      if (finalChunk) {
        setMessages((current) => {
          const last = current[current.length - 1];
          return [
            ...current.slice(0, -1),
            { ...last, content: last.content + finalChunk },
          ];
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.';
      setMessages((current) => {
        const last = current[current.length - 1];
        return [...current.slice(0, -1), { ...last, content: message }];
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="chat-shell">
      <section className="chat-panel" aria-label="Document assistant">
        <header className="chat-header">
          <div className="brand-mark" aria-hidden="true">
            <Image src="/askdocs.svg" alt="" width={256} height={256} />
          </div>
          <div className="brand-copy">
            <h1>Ask your documents</h1>
            <p>Answers grounded in your uploaded files</p>
          </div>
        </header>

        <div className="conversation" aria-live="polite" aria-busy={loading}>
          <MessageList messages={messages} loading={loading} />
        </div>

        <footer className="composer-area">
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={send}
            loading={loading}
          />
        </footer>
      </section>
    </main>
  );
};

export default Chat;
