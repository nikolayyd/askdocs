import type { Message } from 'ollama';
import { pool } from '@/lib/db';
import { embed, toSql } from '@/lib/embed';
import { chatStream } from '@/lib/stream';
import { buildSystemPrompt, NO_ANSWER_BG, NO_ANSWER_EN } from '@/lib/prompt';
import { getCollectionId } from '@/lib/collection';

const MIN_SIMILARITY = 0.55;
const isCyrillic = (text: string) => /[\u0400-\u04FF]/.test(text);

export async function POST(req: Request) {
  let messages: Message[];
  try {
    const body = await req.json();
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json({ error: 'Send a message to start the conversation.' }, { status: 400 });
    }
    messages = body.messages;
    const last = messages[messages.length - 1];
    if (last?.role !== 'user' || typeof last.content !== 'string' || !last.content.trim()) {
      return Response.json({ error: 'The latest message must contain a question.' }, { status: 400 });
    }
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    const question = messages[messages.length - 1].content;
    const [vector] = await embed(question);
    const collectionId = await getCollectionId();
    const { rows } = await pool.query(
      `SELECT e.document AS content,
              1 - (e.embedding <=> $1::vector) AS similarity
       FROM langchain_pg_embedding e
       WHERE e.collection_id = $2
       ORDER BY e.embedding <=> $1::vector
       LIMIT 4`,
      [toSql(vector), collectionId],
    );
    const relevant = rows.filter((row) => Number(row.similarity) >= MIN_SIMILARITY);

    if (relevant.length === 0) {
      return new Response(isCyrillic(question) ? NO_ANSWER_BG : NO_ANSWER_EN, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const context = relevant.map((row) => row.content).join('\n---\n');
    const stream = await chatStream([
      { role: 'system', content: buildSystemPrompt(context) },
      ...messages.slice(-8),
    ]);
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error) {
    console.error('Chat request failed:', error);
    return Response.json({ error: 'The assistant could not answer right now. Check the server configuration and try again.' }, { status: 500 });
  }
}
