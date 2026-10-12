// lib/collection.ts
import { pool } from './db';
import { COLLECTION } from './config';

export const getCollectionId = async () => {
  const { rows } = await pool.query(
    'SELECT uuid FROM langchain_pg_collection WHERE name = $1',
    [COLLECTION],
  );
  if (!rows[0]) throw new Error(`Collection "${COLLECTION}" not found`);
  return rows[0].uuid as string;
};
