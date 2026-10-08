// app/api/chat/route.ts
import type { Message } from 'ollama';
import { chatStream } from '@/lib/stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  try {
    return new Response(await chatStream(messages), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    return new Response(`Failed to fetch from Ollama: + ${err}`, { status: 502 });
  }
}
