// lib/chunk.ts
export const chunk = (text: string, size = 800, overlap = 100) => {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    const part = text.slice(i, i + size).trim();
    if (part) out.push(part);
  }
  return out;
};
