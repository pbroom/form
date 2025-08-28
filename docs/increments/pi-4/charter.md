# Increment Charter – PI-4 (Phase 1 – MVP Core)

## Context Capsule

- Aim: Ship the MVP Core outlined in ARCHITECTURE.md Phase 1 — TS code nodes (linked/inline), schema-driven Properties, command log with undo/redo, and Convex-backed projects (create/save/load).
- Constraints/Guardrails: Deterministic behavior, type safety, accessibility, and adherence to command-first architecture. Keep scope tight to MVP Core.

## Focus (What we ship)

- A minimal end-to-end slice: create a project → insert basic nodes → wire connections → see live preview → undo/redo via command log → export deterministic TSX → save/load project via Convex.

## Prioritized Acceptance Criteria (Cornerstones)

- [ ] TS code nodes support linked and inline attachments; nodes have typed inputs/outputs
- [ ] Properties Panel auto-renders controls from node schema; updates reflect in preview within 100ms
- [ ] Command log records core ops (create/select/connect/setProp/delete) with undo/redo
- [ ] Convex projects API supports create/save/load round-trip for a single-module project
- [ ] Deterministic TSX emitter produces stable output for identical IR

## Efforts

- Effort: Node Graph Essentials

  - Tasks:
    - [ ] Create/select node; connect edges with `targetHandle`
    - [ ] Ensure hidden inputs unless connected; generic input optional
  - ACs:
    - [ ] Core graph interactions stable and accessible
  - Tests (TDD): Playwright specs for selection/connect; unit tests for IR ops
  - Steps: event wiring → state updates → a11y hooks
  - Estimate: M
  - Status: Not started

- Effort: Properties from Schema

  - Tasks:
    - [ ] Schema-driven field rendering (sliders, color, selects)
    - [ ] Bind props → viewport updates
  - ACs:
    - [ ] Controls reflect schema and persist to IR; preview updates in ≤100ms
  - Tests (TDD): unit tests for schema mapping; UI presence tests
  - Steps: schema map → component bindings → debounce/update
  - Estimate: M
  - Status: Not started

- Effort: Command Log + Undo/Redo

  - Tasks:
    - [ ] Log create/select/connect/setProp/delete
    - [ ] Deterministic undo/redo
  - ACs:
    - [ ] Any sequence of logged ops can be undone/redone without corruption
  - Tests (TDD): op invariants; undo/redo round-trips; snapshot of IR
  - Steps: command dispatcher → log storage → reducers → history
  - Estimate: M
  - Status: Not started

- Effort: Convex Sync + Projects

  - Tasks:
    - [ ] Mutations for create/save/load project
    - [ ] Deterministic JSON serialization
  - ACs:
    - [ ] Save→Load round-trip preserves IR and module state
  - Tests (TDD): save/load unit; minimal e2e
  - Steps: schema → mutations/queries → client wiring
  - Estimate: S
  - Status: Not started

- Effort: Deterministic Codegen (TSX)

  - Tasks:
    - [ ] Minimal React/R3F emitter with fenced regions
    - [ ] `tsc --noEmit` typecheck on output
  - ACs:
    - [ ] Identical IR yields identical TSX
  - Tests (TDD): TSX snapshot; typecheck script
  - Steps: tree walk → JSX emit → imports → snapshot
  - Estimate: S
  - Status: Not started

## Scope Fence (Out of Scope)

- Advanced editor QoL (formatting/folding), realtime multi-user collaboration, advanced adapters, Code Node runtime preview, and non-MVP plane/library features.

## Exit Criteria

- All ACs satisfied; tests pass; demo shows create→wire→preview→undo/redo→export→save/load end-to-end.
- Status: In progress
