# Build plan — Design System MCP Server

## Phase 0 — Scaffold (done)
- [x] Repo structure, TypeScript, MCP SDK wiring
- [x] Sample component docs + design tokens
- [x] RAG pipeline with pluggable embedder (local model + keyword fallback)
- [x] OTel tracing per tool call

## Phase 1 — Make it run (30–45 min)
- [ ] `npm install` (add `--include=optional` for real embeddings)
- [ ] `npm start` — confirm it boots and logs the index size
- [ ] `npm run inspect:index -- "your query"` — confirm search returns sensible hits
- [ ] Open with MCP Inspector (`npx @modelcontextprotocol/inspector npm start`), call each tool by hand

## Phase 2 — Connect a real agent (30 min)
- [ ] Register the server in Claude Code (`claude mcp add`) or Claude Desktop config
- [ ] Prompt: "Build a login form using the design system" — watch it call `search_docs` → `get_component` → `get_design_token`
- [ ] Screenshot or screen-record the session for the repo README / LinkedIn

## Phase 3 — Harden the prototype (a few hours, pick what interests you)
- [ ] Add 3–5 more components (Dialog, Table, Tabs, Badge…) — copy the doc format
- [ ] Add a `propose_token` flow or a token-usage report
- [ ] Point OTel at a real collector (`OTEL_EXPORTER_OTLP_ENDPOINT`) and view a trace
- [ ] Dockerfile + GitHub Actions CI

## Phase 4 — Push to GitHub
- [ ] `git init`, first commit, push to github.com/mounikakompalli/design-system-mcp
- [ ] Add repo topics: `mcp`, `design-systems`, `rag`, `opentelemetry`
- [ ] Link it on your LinkedIn featured section and on tailored resumes (Projects section)

## Interview talking points this earns you
- "I built an MCP tool server over a design system, with RAG search and OTel tracing."
- "The embedder is pluggable — local MiniLM by default, keyword fallback without the model."
- "Every tool call emits a span, so agent behavior is observable — that's the part most demos skip."
- Honest scope: "It's a prototype, not production — in-memory index, sample data. The production version would use pgvector and per-agent identity."
