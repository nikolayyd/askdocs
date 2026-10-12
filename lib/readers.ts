// lib/readers.ts
import { extname } from 'path';
import { extractText, getDocumentProxy } from 'unpdf';

const readPdf = async (buffer: Buffer) => {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
};

const readText = (buffer: Buffer) => buffer.toString('utf8');

export const readFile = async (name: string, buffer: Buffer) =>
  extname(name).toLowerCase() === '.pdf' ? readPdf(buffer) : readText(buffer);