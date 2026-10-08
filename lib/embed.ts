// lib/embed.ts
import { Ollama } from 'ollama';

const ollama = new Ollama({ host: process.env.OLLAMA_URL });

export const embed = async (input: string | string[]) => {
  const res = await ollama.embed({ model: 'nomic-embed-text', input });
  return res.embeddings;
};

export const toSql = (v: number[]) => `[${v.join(',')}]`;
