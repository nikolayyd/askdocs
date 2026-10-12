// lib/store.ts
import { randomUUID } from 'crypto';
import { pool } from './db';
import { toSql } from './embed';

export const deleteBySource = (collectionId: string, source: string) =>
  pool.query(
    `DELETE FROM langchain_pg_embedding
     WHERE collection_id = $1 AND cmetadata->>'source' = $2`,
    [collectionId, source],
  );

export const insertChunk = (
  collectionId: string,
  content: string,
  vector: number[],
  metadata: Record<string, unknown>,
) =>
  pool.query(
    `INSERT INTO langchain_pg_embedding (id, collection_id, embedding, document, cmetadata)
     VALUES ($1, $2, $3::vector, $4, $5::jsonb)`,
    [
      randomUUID(),
      collectionId,
      toSql(vector),
      content,
      JSON.stringify(metadata),
    ],
  );
