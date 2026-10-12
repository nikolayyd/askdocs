// lib/ingest.ts
import { chunk } from '@/lib/chunk';
import { embed } from '@/lib/embed';
import { readFile } from '@/lib/readers';
import { getCollectionId } from '@/lib/collection';
import { deleteBySource, insertChunk } from '@/lib/store';

const BATCH = 32;

export const ingestFile = async (name: string, buffer: Buffer) => {
  const text = await readFile(name, buffer);
  const chunks = chunk(text);
  if (chunks.length === 0) throw new Error('No text extracted');

  const collectionId = await getCollectionId();
  await deleteBySource(collectionId, name);

  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    const vectors = await embed(batch);

    for (let j = 0; j < batch.length; j++) {
      await insertChunk(collectionId, batch[j], vectors[j], {
        source: name,
        chunk: i + j,
      });
    }
  }

  return chunks.length;
};
