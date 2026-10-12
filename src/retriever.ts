import type { ComponentDoc } from './data.js';

/**
 * Embeddings are pluggable. TransformersEmbedder runs the all-MiniLM-L6-v2
 * model locally (no API key, ~90MB download on first use). KeywordEmbedder is
 * the zero-dependency fallback so the server runs even without the model.
 * The rest of the pipeline doesn't care which one is in use.
 */
export interface Embedder {
  readonly kind: string;
  embed(texts: string[]): Promise<number[][]>;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na === 0 || nb === 0 ? 0 : dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export class TransformersEmbedder implements Embedder {
  readonly kind = 'transformers:all-MiniLM-L6-v2';
  private extractor: any = null;

  async embed(texts: string[]): Promise<number[][]> {
    if (!this.extractor) {
      // Lazy import: the model package is an optionalDependency.
      const { pipeline } = await import('@xenova/transformers');
      console.error('[rag] loading local embedding model (first run downloads ~90MB)…');
      this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    const out = await this.extractor(texts, { pooling: 'mean', normalize: true });
    return out.tolist() as number[][];
  }
}

export class KeywordEmbedder implements Embedder {
  readonly kind = 'keyword-fallback';
  // Persistent across calls so word indices stay aligned between the
  // indexed docs and later queries (new words are appended, never reordered).
  private vocab = new Map<string, number>();

  async embed(texts: string[]): Promise<number[][]> {
    // Not real embeddings — bag-of-words vectors so the pipeline works
    // without the model. Scores are weaker; the interface stays the same.
    const tokenized = texts.map((t) =>
      t.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2),
    );
    for (const toks of tokenized) {
      for (const w of toks) if (!this.vocab.has(w)) this.vocab.set(w, this.vocab.size);
    }
    return tokenized.map((toks) => {
      const v = new Array(this.vocab.size).fill(0);
      for (const w of toks) v[this.vocab.get(w)!] += 1;
      const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
      return v.map((x) => x / n);
    });
  }
}

export interface IndexedDoc {
  id: string;
  text: string;
  vector: number[];
}

export interface SearchHit {
  id: string;
  score: number;
  text: string;
}

export async function buildIndex(docs: ComponentDoc[], embedder: Embedder): Promise<IndexedDoc[]> {
  const texts = docs.map((d) => `${d.name}\n${d.description}\n${d.markdown}`);
  const vectors = await embedder.embed(texts);
  return docs.map((d, i) => ({ id: d.name, text: texts[i], vector: vectors[i] }));
}

export async function searchIndex(
  index: IndexedDoc[],
  query: string,
  embedder: Embedder,
  topK = 3,
): Promise<SearchHit[]> {
  const [qv] = await embedder.embed([query]);
  // Stateful fallback embedders may grow their vocabulary between calls;
  // pad all vectors to a common width so cosine stays meaningful.
  const width = Math.max(qv.length, ...index.map((d) => d.vector.length));
  const pad = (v: number[]) => (v.length >= width ? v : [...v, ...new Array(width - v.length).fill(0)]);
  const q = pad(qv);
  return index
    .map((d) => ({ id: d.id, score: cosine(q, pad(d.vector)), text: d.text }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/** Prefer the real model; fall back gracefully if it's not installed. */
export async function defaultEmbedder(): Promise<Embedder> {
  try {
    await import('@xenova/transformers');
    return new TransformersEmbedder();
  } catch {
    console.error('[rag] @xenova/transformers not installed — using keyword fallback. Run `npm install --include=optional` for real embeddings.');
    return new KeywordEmbedder();
  }
}
