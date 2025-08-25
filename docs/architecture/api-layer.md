# API Layer

Goals

- Dogfoodable API powering the app
- Stable surface for external automation (e.g., MCP server/agents)

Scope

- Project operations: create/open/save/export/import
- Graph operations: add/remove/update nodes/edges, selection, commands
- Render/compute: trigger evaluations, snapshots

Design

- Typed interface + HTTP/JSON (if servered) or in-process module
- Auth & multi-tenant when networked
- Versioned endpoints and schema

Emitters and integration

- Provide programmatic emitters for React/R3F and Three.js
- Expose IR read/write and codegen as API calls
- Fence generated regions to enable safe round-tripping

Agents/MCP alignment

- Define high-level commands ("add node", "connect", "generate code")
- Validate inputs via Zod/JSON Schema; return structured errors
- Stream progress for long operations (adapters, large codegen)

Build guidance

- Start with an internal TypeScript service layer
- Define request/response types and errors
- Later expose HTTP routes or MCP protocol bindings
