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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a message..."
        style={{ flex: 1, resize: 'none', padding: 8 }}
      />
      <button onClick={onSend} disabled={loading || !value.trim()}>
        {loading ? '...' : 'Send'}
      </button>
    </div>
  );
};

export default ChatInput;
