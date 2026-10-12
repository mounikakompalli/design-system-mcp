import { loadComponents, loadTokens } from './data.js';
import { buildIndex, defaultEmbedder } from './retriever.js';

/** Tiny CLI to sanity-check the index: `npm run inspect:index -- "your query"` */
async function main() {
  const query = process.argv[2] ?? 'accessible form input';
  const components = loadComponents();
  const tokens = loadTokens();
  const embedder = await defaultEmbedder();
  const index = await buildIndex(components, embedder);
  console.log(`components=${components.length} tokens=${Object.keys(tokens).length} embedder=${embedder.kind}`);
  const { searchIndex } = await import('./retriever.js');
  const hits = await searchIndex(index, query, embedder, 3);
  for (const h of hits) console.log(`- ${h.id} (${h.score.toFixed(3)})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
