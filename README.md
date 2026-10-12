# Design System MCP Server

A **learning prototype**: an MCP (Model Context Protocol) server that exposes a
design system's components, design tokens, and documentation as tools an AI
agent can call — with semantic search (RAG) over the docs and OpenTelemetry
tracing on every tool call.

The idea: instead of an agent guessing at your component API from a screenshot
or a stale README, it asks the design system itself. `search_docs` answers
"which component should I use for a confirmation dialog?"; `get_component`
returns the full spec including tokens and accessibility notes;
`get_design_token` resolves the exact value.

```
 ┌──────────────┐      stdio / MCP       ┌───────────────────────┐
 │  AI agent    │ ◄────────────────────► │  design-system-mcp    │
 │ (Claude Code │                        │                       │
 │  / Desktop)  │                        │  tools:               │
 └──────────────┘                        │   • list_components   │
                                         │   • get_component     │
                                         │   • get_design_token  │
                                         │   • search_docs (RAG) │
                                         │                       │
                                         │  tracing: OTel spans  │
                                         │  per tool call        │
                                         └───────────────────────┘
```

## What's real vs. what's simplified

| Piece | Status |
|---|---|
| MCP server (stdio), 4 tools | Real, works with MCP Inspector / Claude Code / Claude Desktop |
| RAG: embeddings + cosine search over component docs | Real via local `all-MiniLM-L6-v2` (no API key); keyword fallback if the model isn't installed |
| Vector storage | In-memory (fine for a prototype; a production version would use pgvector/Qdrant) |
| Tracing | Real OTel spans per tool call; console exporter by default, OTLP-ready |
| Component/token data | Sample data modeled on real design-token work (spacing, density, color) |

## Quickstart

```bash
npm install            # add --include=optional for the local embedding model
npm start              # runs the MCP server on stdio
```

Smoke-test the search index without an MCP client:

```bash
npm run inspect:index -- "accessible form input"
```

Inspect the tools with the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector npm start
```

### Use it from Claude Code

```bash
claude mcp add design-system -- npm start --prefix /path/to/design-system-mcp
```

### Use it from Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "design-system": {
      "command": "npm",
      "args": ["start", "--prefix", "/path/to/design-system-mcp"]
    }
  }
}
```

Then ask: *"Build me a login form using the design system components."*

## Roadmap

- [ ] Swap in-memory index for pgvector/Qdrant
- [ ] Per-agent identity: sign tool calls so generated code is attributable to the agent
- [ ] Token write path: propose new tokens from agent usage patterns, with human review
- [ ] Eval harness: does the agent pick the right component for 50 prompt scenarios?
- [ ] Dockerfile + CI

## Why this exists

Built to learn, hands-on, the stack behind AI-assisted developer platforms:
MCP tool servers, RAG over real documentation, and observable agent tooling.
