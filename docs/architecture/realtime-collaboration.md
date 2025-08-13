# Realtime Collaboration

Goals

- Multiple users edit the same project concurrently
- Low-latency updates, conflict-free merging, offline resilience

Approaches

- CRDT (e.g., Yjs) for shared state (nodes, edges, selection)
- Transport: WebRTC or WebSocket via a signaling server

Presence

- Track cursors, selections, and user list
- Color-coded user presence indicators

Auth & Permissions

- Project membership, roles (owner/editor/viewer)
- Session tokens; later integrate with identity provider

IR sync

- Sync IR (GraphLayer, TreeLayer, MetaLayer) fields with CRDT maps/arrays
- Use schema validators on incoming changes
- Debounce code generation and preview updates from remote edits

Convex option (candidate for 6.5)

- Architecture
  - Use Convex as the realtime backend (DB + functions + live queries)
  - Model project IR/state in Convex tables (project, modules, nodes, edges, selections)
  - Expose mutation functions (addNode, connect, setProp, saveProject) and subscribe via live queries
  - Presence: store user presence/selection in a dedicated table updated on heartbeat
  - Auth: integrate Convex auth providers; map to project roles
- Sync model
  - Option A: Authoritative state in Convex; clients apply ops by calling mutations; live queries stream updates
  - Option B: Hybrid with CRDT client-side (Yjs) and Convex persistence/sync; Convex stores CRDT updates
- Pros
  - Managed realtime, persistence, and auth; fewer moving parts than self-hosting websockets
  - Strong live-query model reduces manual fan-out logic
- Cons
  - Vendor coupling; CRDT semantics need careful mapping if hybrid
  - Custom emit/debounce strategy still required for preview/codegen
- MVP path
  1. Define Convex schema for projects/modules/nodes/edges/selections
  2. Implement core mutations and live queries for a single project
  3. Wire editor to call mutations for edits and subscribe to live queries for updates
  4. Add presence (selection cursors) and basic roles
  5. Optional: store full project snapshots for import/export

Build guidance

- Start with Yjs + y-websocket for prototype or use Convex for an all-in-one managed approach
- Map editor state to shared structures (CRDT docs or Convex tables)
- Reconcile local UI with incoming updates and validate against schema
