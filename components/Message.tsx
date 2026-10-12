'use client';

import type { Message as OllamaMessage } from 'ollama';

type Props = {
  message: Pick<OllamaMessage, 'role' | 'content'>;
  pending?: boolean;
};

const Message = ({ message, pending = false }: Props) => {
  const isUser = message.role === 'user';
  return (
    <article
      className={`message-row ${isUser ? 'message-row-user' : 'message-row-assistant'}`}
    >
      {!isUser && (
        <div className="assistant-avatar" aria-hidden="true">
          ✦
        </div>
      )}
      <div
        className={`message-bubble ${isUser ? 'message-bubble-user' : 'message-bubble-assistant'}`}
      >
        {message.content ? (
          <p>{message.content}</p>
        ) : pending ? (
          <span className="typing-indicator" aria-label="Writing">
            <i />
            <i />
            <i />
          </span>
        ) : null}
      </div>
    </article>
  );
};

export default Message;
