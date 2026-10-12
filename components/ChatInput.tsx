// components/ChatInput.tsx
'use client';

import { useEffect, useRef, type KeyboardEvent } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading?: boolean;
};

const ChatInput = ({ value, onChange, onSend, loading = false }: Props) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  // auto-resize
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="chat-input">
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your documents…"
        aria-label="Your message"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={loading || !value.trim()}
        aria-label="Send message"
      >
        {loading ? '…' : '↑'}
      </button>
    </div>
  );
};

export default ChatInput;
