// app/api/ingest/route.ts
import { ingestFile } from '@/lib/ingest';

const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file');

  if (!(file instanceof File)) {
    return Response.json({ error: 'No file' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'File too large' }, { status: 413 });
  }

  try {
    const chunks = await ingestFile(
      file.name,
      Buffer.from(await file.arrayBuffer()),
    );
    return Response.json({ chunks });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
