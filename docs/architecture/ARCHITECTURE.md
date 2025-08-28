<!-- markdownlint-disable MD013 -->

# Form: Node Graph Editor – Architecture & Increment Roadmap

This document is the reference for the **Form** project — a node-graph-based editor for building visuals with code.  
It defines the philosophy, goals, architecture, mechanics, modules, tech preferences, and roadmap. Cursor AI agents should use this doc as the source of truth when implementing features.

---

## 1. Philosophy & Principles

- **Command-first**: Every UI action is a small, named command (idempotent where possible).
  - The **UI**, **keyboard shortcuts**, **HTTP API**, **WebSocket**, and **MCP** all call the same command vocabulary.
  - Ensures **consistency, observability, undoability, and agent-operability**.
- **Unified Node Model**: All nodes are **code nodes**. Subgraph “planes” are just templates with `impl.kind:"subgraph"`.
- **Templates & Instances**: Canvas nodes are instances of reusable templates (with attachment modes: `linked`, `forked`, `inline`, `baked`).
- **Determinism**: Evaluation is deterministic (time- and seed-driven).
- **Transparency**: Code View exposes underlying code for all nodes, including built-ins.
- **Composability**: Encapsulation, reuse, and dependency management via planes.
- **Accessibility**: Every feature is keyboard-accessible, screen-reader compatible, and a11y tested.
- **Incremental**: Progress is driven by the **Increment Charter/Log system**.

---

## 2. Key Goals

- **Core Panels**:
  - Node Graph Editor (infinite canvas)
  - Properties Panel (data-driven, from schema)
  - Code View (CodeMirror editor)
  - Viewport (live preview)
  - Library (browse/search templates, assets, macros)
- **Functionality**:
  - Grouping → Planes (subgraph templates with explicit interfaces)
  - Multi-language code nodes (TS/JS → GLSL → WASM → Python)
  - Display nodes (inline previews with perf constraints)
  - Undo/redo via command log
  - Realtime collaboration (Convex ops log)
  - Projects: create/load/share
  - Libraries: save/search/share templates/assets
  - Authentication, roles, permissions (WorkOS + Convex)
  - Snapshots & history (time travel)

---

## 3. Architecture Overview

### Core Objects

- **Template**: reusable node definition. Impl = `code` (manifest) or `subgraph` (graph).
- **Node**: instance of a Template + attachment header (linked/forked/inline/baked).
- **Plane**: a Template with `impl.kind:"subgraph"`.
- **Graph**: nodes + edges inside a plane.
- **Project**: planes, graphs, assets, library.
- **Library**: templates, macros, assets (user/project/team/public scopes).

### Node IR

```ts
type IRNode = {
	init?(ctx, props): InitResult;
	update?(ctx, props): UpdateResult;
	eval(ctx, inputs, props): Record<string, Value>;
};
```

### Plane Interface Contract (PIC)

- Inputs (typed ports, fixtures, required/variadic flags)
- Outputs (typed ports, can be zero or many)
- Exposure (which ports are visible to parent instances)
- Versioning (semver; additive = minor, breaking = major)

### Persistence

- Convex DB for projects, templates, nodes, ops, assets, libraries.
- Command log = source of truth for undo/redo, collab, snapshots.

---

## 4. Mechanics & Rules

- **Grouping** → autogenerate PIC, create new Template, replace selection with linked Node.
- **Overrides** → local JSON patches on PIC (rename/hide/show ports, default props).
- **Upgrades** → diff old vs new PIC, run remap wizard; unresolvable edges marked unbound.
- **Forking** → new Template, Node switches to forked attachment.
- **Inline** → node carries private manifest/subgraph.
- **Baked** → node stores compiled artifact only (perf, distribution).
- **Zero-output planes** → valid as sinks; parent edges flagged unbound if removed.
- **Multi-output planes** → valid; all outputs exposed; one may be starred `defaultExport`.

---

## 5. Modules / Components

- **Node Graph Editor**: React Flow + custom Handle/Edge.
- **Properties Panel**: schema-driven; shadcn UI components.
- **Code View**: CodeMirror w/ diagnostics.
- **Viewport**: WebGPU/WebGL preview.
- **Library Panel**: search/insert templates/assets.
- **Display Nodes**: inline preview nodes; budgeted/throttled.
- **Realtime Backend**: Convex DB + WS session ops.
- **Authentication**: WorkOS integration + Convex role-based access.
- **API**: HTTP + WS, OpenAPI/AsyncAPI.

---

## 6. Tech Preferences

- **Backend/Realtime**: Convex
- **Auth**: WorkOS + Convex
- **Canvas**: React Flow
- **State**: Zustand
- **Code Editor**: CodeMirror
- **UI**: shadcn + Tailwind 4.1+
- **Animation**: motion (Framer Motion)
- **Runtime**: TS/JS in workers, GLSL → WebGPU/WebGL, WASM, Pyodide

---

## 7. Roadmap – Incremental Development

Development is structured using the **Increment Method**, not sprints.  
Each increment is defined by a **Charter** and tracked by a **Log**.

### Increment Artifacts

- **Increment Charter (IC)**:

  - Context Capsule: aim + constraints
  - Focus: 1–2 sentences (what we ship)
  - Prioritized ACs: cornerstone acceptance criteria
  - Efforts: tasks + ACs + TDD steps + estimate + status
  - Scope Fence: what’s out of scope
  - Exit Criteria: definition of done (tests pass; demoable)

- **Increment Log (IL)**:
  - Concise running log of progress (commits/decisions/tests)
  - 3–6 bullets per entry

### TDD Loop (per task)

1. Define ACs + tests
2. Write tests/fixtures (fail)
3. Implement minimal code
4. Make tests pass; refactor
5. Update IC status; add IL entry

---

## 8. Roadmap Phases (high-level)

- **Phase 1 – MVP Core**

  - TS code nodes (linked, inline)
  - Properties from schema
  - Command log + undo/redo
  - Convex sync + projects

- **Phase 2 – Planes & Libraries**

  - Grouping → subgraph templates
  - PIC autogen
  - Library CRUD
  - Basic realtime collab + presence
  - Snapshots

- **Phase 3 – Displays & Search**

  - Display nodes (image/scalar)
  - GLSL node runtime
  - Library search & filters
  - Roles/sharing

- **Phase 4 – Attachments & Upgrades**

  - Attachment modes (forked, baked, inline)
  - Upgrade/remap wizard
  - Overrides

- **Phase 5 – Publishing & Telemetry**
  - Public libraries + publishing
  - Advanced telemetry (perf, audit)
  - MCP agent tools

---

## 9. Agent Instructions (for Cursor AI)

- **Use Commands First**: Implement UI by dispatching commands; never bypass them.
- **Respect Increments**: Only implement what’s in the **current increment’s charter**.
- **Follow Mechanics**: Grouping, upgrades, attachments, overrides must conform to this doc.
- **UI**: Always build with shadcn + Tailwind, with a11y and keyboard shortcuts.
- **Backend**: Implement Convex mutations for all command log ops; ensure idempotency.
- **Testing**:
  - Golden tests for node eval outputs
  - Snapshot tests for PICs
  - Fuzz tests for adapters

---
