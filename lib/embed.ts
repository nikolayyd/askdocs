import { Ollama } from 'ollama';

const EMBED_MODEL = process.env.EMBED_MODEL ?? 'bge-m3';
const ollama = new Ollama({ host: process.env.OLLAMA_URL });

export const embed = async (input: string | string[]): Promise<number[][]> => {
  try {
    const res = await ollama.embed({ model: EMBED_MODEL, input });
    return res.embeddings;
  } catch (err) {
    console.error('Error embedding input:', err);
    throw err;
  }
};

export const toSql = (v: number[]) => `[${v.join(',')}]`;
