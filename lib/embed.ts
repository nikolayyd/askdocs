// lib/embed.ts
import ollama from 'ollama';
const EMBED_MODEL = process.env.EMBED_MODEL ?? 'bge-m3';

export const embed = async (input: string | string[]) => {
  const res = await ollama.embed({ model: EMBED_MODEL, input });
  return res.embeddings;
};

export const toSql = (v: number[]) => `[${v.join(',')}]`;