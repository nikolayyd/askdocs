# AskDocs

AskDocs lets you upload PDF, TXT, and Markdown files, then ask questions grounded in their contents. It extracts text, splits it into overlapping chunks, stores Ollama embeddings in PostgreSQL with pgvector, retrieves the four closest chunks for each question, and streams an answer from an Ollama chat model. If no chunk is relevant enough, it returns a no-answer message instead of guessing.

## How the code fits together

- `app/` contains the Ask and Ingest pages and the `/api/chat` and `/api/ingest` endpoints.
- `lib/readers.ts`, `lib/chunk.ts`, and `lib/ingest.ts` extract, split, embed, and store documents. Re-uploading a file replaces its stored chunks.
- `lib/embed.ts` creates vectors through Ollama. `lib/store.ts` and `lib/collection.ts` read and write the selected pgvector collection.
- `app/api/chat/route.ts` embeds the question, retrieves up to four matching chunks, and streams the response from Ollama.

## Requirements

- Node.js 20.9 or newer
- PostgreSQL with the pgvector extension and the two tables below
- An Ollama server reachable by the app, with a chat model and an embedding model pulled

## Run locally

Install dependencies:

```bash
npm ci
```

Create `.env.local` in the project root:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
COLLECTION_NAME=askdocs
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=your-chat-model
EMBED_MODEL=bge-m3
```

`EMBED_MODEL` defaults to `bge-m3`. The embedding column must have the same vector dimensions as the embedding model; `bge-m3` uses 1024 dimensions.

Create the database extension, tables, and collection (change `askdocs` if `COLLECTION_NAME` differs):

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS langchain_pg_collection (
  uuid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar UNIQUE,
  cmetadata json
);

CREATE TABLE IF NOT EXISTS langchain_pg_embedding (
  id varchar PRIMARY KEY,
  collection_id uuid REFERENCES langchain_pg_collection(uuid) ON DELETE CASCADE,
  embedding vector(1024),
  document text,
  cmetadata jsonb
);

INSERT INTO langchain_pg_collection (name)
VALUES ('askdocs')
ON CONFLICT (name) DO NOTHING;
```

Pull the models on the Ollama server. Replace the chat model with the value used for `OLLAMA_MODEL`:

```bash
ollama pull your-chat-model
ollama pull bge-m3
```

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Deploy as a Node.js app on a host that can connect to both PostgreSQL and Ollama. The database and Ollama server must remain reachable from the running app; Ollama can run on another machine if `OLLAMA_URL` points to it.

1. Provision PostgreSQL with pgvector, then run the SQL above. Use the collection name configured in `COLLECTION_NAME`.
2. Install and pull the chat and embedding models on the Ollama server.
3. Deploy the repository with Node.js 20.9 or newer. Set `DATABASE_URL`, `COLLECTION_NAME`, `OLLAMA_URL`, and `OLLAMA_MODEL` in the host’s environment settings. Set `EMBED_MODEL` only if using a different embedding model with a matching database vector dimension.
4. Build and start the app with:

   ```bash
   npm ci
   npm run build
   npm run start
   ```

The Ingest endpoint accepts files up to 10 MB. Keep the Ollama and database endpoints private and allow connections from the app host.
