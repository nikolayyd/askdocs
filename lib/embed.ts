import ollama from 'ollama';

const EMBED_MODEL = process.env.EMBED_MODEL ?? 'bge-m3';

if (!EMBED_MODEL) {
  throw new Error('EMBED_MODEL environment variable is not set');
}

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
