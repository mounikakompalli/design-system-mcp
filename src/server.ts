import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { trace, type Span } from '@opentelemetry/api';
import { z } from 'zod';
import { initTelemetry } from './telemetry.js';
import { loadComponents, loadTokens } from './data.js';
import { buildIndex, searchIndex, defaultEmbedder, type IndexedDoc, type Embedder } from './retriever.js';

initTelemetry();
const tracer = trace.getTracer('design-system-mcp');

/** Run a tool handler inside an OpenTelemetry span. */
async function withSpan<T>(name: string, attrs: Record<string, string | number>, fn: (span: Span) => Promise<T>): Promise<T> {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      for (const [k, v] of Object.entries(attrs)) span.setAttribute(k, v);
      return await fn(span);
    } catch (err) {
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });
}

const text = (t: string) => ({ content: [{ type: 'text' as const, text: t }] });

async function main() {
  const components = loadComponents();
  const tokens = loadTokens();
  const embedder: Embedder = await defaultEmbedder();
  const index: IndexedDoc[] = await buildIndex(components, embedder);
  console.error(`[server] indexed ${index.length} components (embedder=${embedder.kind})`);

  const server = new McpServer({ name: 'design-system-mcp', version: '0.1.0' });

  server.tool('list_components', 'List all components in the design system with one-line descriptions.', {}, async () =>
    withSpan('tool.list_components', { component_count: components.length }, async () => {
      const lines = components.map((c) => `- ${c.name}: ${c.description}`);
      return text(lines.join('\n'));
    }),
  );

  server.tool(
    'get_component',
    'Get the full documentation for one component: props, design tokens it uses, usage guidance, and accessibility notes.',
    { name: z.string().describe('Component name, e.g. "button"') },
    async ({ name }) =>
      withSpan('tool.get_component', { component: name }, async (span) => {
        const c = components.find((x) => x.name === name.toLowerCase());
        if (!c) {
          span.setAttribute('found', false);
          return text(`Component "${name}" not found. Available: ${components.map((x) => x.name).join(', ')}`);
        }
        span.setAttribute('found', true);
        return text(c.markdown);
      }),
  );

  server.tool(
    'get_design_token',
    'Look up a design token by name. Returns its value, type, and description.',
    { name: z.string().describe('Token name, e.g. "spacing.md" or "color.primary"') },
    async ({ name }) =>
      withSpan('tool.get_design_token', { token: name }, async (span) => {
        const t = tokens[name];
        if (!t) {
          span.setAttribute('found', false);
          const keys = Object.keys(tokens).slice(0, 20).join(', ');
          return text(`Token "${name}" not found. Examples: ${keys} …`);
        }
        span.setAttribute('found', true);
        return text(JSON.stringify({ name, ...t }, null, 2));
      }),
  );

  server.tool(
    'search_docs',
    'Semantic search over component documentation. Ask in plain language, e.g. "which component should I use for a confirmation dialog?"',
    { query: z.string().describe('Natural-language question about the design system'), top_k: z.number().min(1).max(5).default(3) },
    async ({ query, top_k }) =>
      withSpan('tool.search_docs', { query, top_k, embedder: embedder.kind }, async (span) => {
        const hits = await searchIndex(index, query, embedder, top_k);
        span.setAttribute('top_score', hits[0]?.score ?? 0);
        const out = hits
          .map((h, i) => `### ${i + 1}. ${h.id} (score ${h.score.toFixed(3)})\n${h.text.slice(0, 1200)}`)
          .join('\n\n');
        return text(out);
      }),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[server] design-system-mcp running on stdio');
}

main().catch((err) => {
  console.error('[server] fatal:', err);
  process.exit(1);
});
