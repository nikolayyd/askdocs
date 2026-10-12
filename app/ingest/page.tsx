'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

const IngestPage = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');

  const upload = async (file?: File) => {
    if (!file || uploading) return;
    setUploading(true);
    setNotice(`Adding ${file.name}…`);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/ingest', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not add this file.');
      setNotice(`${file.name} added · ${data.chunks} text chunks`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not add this file.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <main className="ingest-shell">
      <section className="ingest-panel" aria-labelledby="ingest-title">
        <div className="brand-mark ingest-logo" aria-hidden="true"><Image src="/askdocs.svg" alt="" width={256} height={256} /></div>
        <p className="eyebrow">YOUR LIBRARY</p>
        <h1 id="ingest-title">Add documents</h1>
        <p className="ingest-description">Upload a document to make its contents available when you ask a question.</p>
        <input
          ref={fileRef}
          className="visually-hidden"
          type="file"
          accept=".pdf,.txt,.md"
          onChange={(event) => upload(event.target.files?.[0])}
          aria-label="Choose a document to add"
        />
        <button className="ingest-button" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? 'Adding document…' : '＋ Choose a document'}
        </button>
        <p className="file-types">PDF, TXT, or Markdown</p>
        {notice && <p className="ingest-notice" role="status">{notice}</p>}
      </section>
    </main>
  );
};

export default IngestPage;
