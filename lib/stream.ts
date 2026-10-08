// lib/stream.ts
import { Ollama, type Message } from 'ollama';

const ollama = new Ollama({ host: process.env.OLLAMA_URL });

export const chatStream = async (messages: Message[]) => {
  const stream = await ollama.chat({
    model: process.env.OLLAMA_MODEL!,
    messages,
    stream: true,
    options: { num_ctx: 4096 },
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for await (const part of stream) {
        controller.enqueue(encoder.encode(part.message.content));
      }
      controller.close();
    },
  });
};
