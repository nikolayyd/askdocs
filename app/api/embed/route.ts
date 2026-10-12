// app/api/chat/route.ts
import { pool } from '@/lib/db';
import { embed, toSql } from '@/lib/embed';
import { chatStream } from '@/lib/stream';
import { buildSystemPrompt, NO_ANSWER_BG, NO_ANSWER_EN } from '@/lib/prompt';

const MIN_SIMILARITY = 0.55;

const isCyrillic = (s: string) => /[\u0400-\u04FF]/.test(s);

export async function POST(req: Request) {
  const { messages } = await req.json();
  const question = messages[messages.length - 1].content;

  const [vec] = await embed(question);
  const { rows } = await pool.query(
    `SELECT e.document AS content,
          e.cmetadata,
          1 - (e.embedding <=> $1::vector) AS similarity
   FROM langchain_pg_embedding e
   ORDER BY e.embedding <=> $1::vector
   LIMIT 4`,
    [toSql(vec)],
  );

  console.log(rows.map((r) => Number(r.similarity).toFixed(2)));

  const relevant = rows.filter((r) => r.similarity >= MIN_SIMILARITY);

  if (relevant.length === 0) {
    return new Response(isCyrillic(question) ? NO_ANSWER_BG : NO_ANSWER_EN, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const context = relevant.map((r) => r.content).join('\n---\n');
  const stream = await chatStream([
    { role: 'system', content: buildSystemPrompt(context) },
    ...messages.slice(-8),
  ]);

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
