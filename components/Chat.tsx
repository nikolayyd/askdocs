// components/Chat.tsx
'use client';

import { useState } from 'react';
import type { Message } from 'ollama';

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;

    const history: Message[] = [...messages, { role: 'user', content: input }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) throw new Error('Request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + chunk },
          ];
        });
      }
    } catch {
      // TODO: покажи грешка (напр. сложи текст в последното съобщение)
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      {messages.map((message, index) => (
        <div key={index}>
          <strong>{message.role}:</strong> {message.content}
        </div>
      ))}
    </div>
  );
};

export default Chat;
