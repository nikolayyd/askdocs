// lib/stream.ts
import { Ollama, type Message } from 'ollama';

const ollama = new Ollama({ host: process.env.OLLAMA_URL });

export const chatStream = async (messages: Message[]) => {
  const stream = await ollama.chat({
    model: process.env.OLLAMA_MODEL!,
    messages,
    stream: true,
    think: false,
    options: { num_ctx: 8192, temperature: 0.2 },
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const part of stream) {
          controller.enqueue(encoder.encode(part.message.content));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      
      stream.abort();
    },
  });
};
