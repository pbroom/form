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
    - [x] Scaffold custom Node/Handle/Edge primitives with `ConnectionTarget`
    - [x] Globalize React Flow base CSS and ensure Tailwind overrides
    - [x] Extend runtime IR with `templateRef` and `hud` on nodes
    - [x] Add HUD wrapper for nodes (Appendix-style) and demo content on default code node
  - ACs:
    - [ ] Core graph interactions stable and accessible; Tailwind consistently overrides React Flow defaults per theming guide
  - Tests (TDD): Playwright specs for selection/connect; unit tests for IR ops
  - Steps: event wiring → state updates → a11y hooks
  - Estimate: M
  - Status: In progress

- Effort: Properties from Schema

  - Tasks:
    - [ ] Schema-driven field rendering (sliders, color, selects)
    - [ ] Bind props → viewport updates
  - ACs:
    - [ ] Controls reflect schema and persist to IR; preview updates in ≤100ms
  - Tests (TDD): unit tests for schema mapping; UI presence tests
  - Steps: schema map → component bindings → debounce/update
  - Estimate: M
  - Status: In progress

- Effort: Code Editing (Monaco Integration)

  - Tasks:
    - [x] Replace CodeMirror with Monaco in `CodeView`
    - [x] Reuse `CodeView` from `PropertiesPanel` to avoid duplication
    - [x] Expose editor preferences: custom light/dark themes, monospace font, minimap
    - [ ] Expose simple options prop for future QoL (formatting/folding)
  - ACs:
    - [x] Editors render with `data-testid="code-editor-textarea"` unchanged
    - [x] Value/onChange behavior unchanged; 100ms debounce remains at callsite
  - Tests (TDD): Rely on existing selectors in PW specs; unit impact none
  - Steps: Install deps → swap component → refactor usage → run tests
  - Estimate: S
  - Status: Done

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
    - [x] Mutations for create/save/load project
    - [x] Deterministic JSON serialization
  - ACs:
    - [ ] Save→Load round-trip preserves IR and module state
  - Tests (TDD): save/load unit; minimal e2e
  - Steps: schema → mutations/queries → client wiring
  - Estimate: S
  - Status: In progress

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

- Effort: Code View Authoring Guidance

  - Tasks:
    - [x] Document Node Package layout and inference rules (TS/JS/GLSL/Python)
    - [x] Define overlays for meta/ports/hud/controls/dialogs
  - ACs:
    - [x] ARCHITECTURE.md includes conventions and precedence
  - Tests (TDD): N/A (doc-only)
  - Steps: Update architecture doc; add charter/log entries
  - Estimate: XS
  - Status: Done

- Effort: Floating Dialogs — Architecture & Spec

  - Tasks:
    - [x] Author architecture RFC and component/state contracts
    - [ ] Define minimal store and host/rendering strategy
    - [ ] Specify a11y, keyboard, and dismissal rules with tests
  - ACs:
    - [ ] Architecture doc exists and is linked from ARCHITECTURE.md
    - [ ] Store interface covers open/close/stack/position and parent→child lifecycle
    - [ ] Test plan enumerated (unit + e2e + a11y)
  - Tests (TDD): RFC-level checklist; unit tests to be added when implementation is scheduled
  - Steps: write RFC → update architecture index → align with Properties Panel triggers → plan future implementation
  - Estimate: S
  - Status: In progress

- Effort: Docs Tooling Compatibility

  - Tasks:
    - [x] Bump `typedoc` to support TypeScript 5.8
    - [x] Update `vitepress` and DocSearch to support React 19
  - ACs:
    - [x] `pnpm install` shows no peer dependency warnings for TypeDoc/DocSearch
  - Tests (TDD): None (tooling only); verify install output is clean
  - Steps: update `package.json` versions and add pnpm overrides for DocSearch
  - Estimate: XS
  - Status: Done

- Effort: Cursor Slash Commands

  - Tasks:
    - [x] Create `/p` command implementing Increment Method flow
    - [x] Create `/p -f` command for feedback processing
    - [x] Add checklists to both commands
  - ACs:
    - [x] Commands appear under `/` in Cursor and are selectable
    - [x] Command text mirrors `.cursor/rules/increments.mdc` flow
    - [x] Checklists present covering pre-flight, TDD loop, post-action sync, and guardrails
  - Tests (TDD): N/A (docs/agent integration); manual verify commands list and content
  - Steps: add `.cursor/commands/{p.md,p-feedback.md}` with deterministic instructions and links
  - Estimate: XS
  - Status: Done

- Effort: Trunk + Preview Commands

  - Tasks:
    - [x] Create stacked PR command (Graphite)
    - [x] Submit + label PR for preview composition
    - [x] Restack command when `main` moves
    - [x] Preview integration branch workflow command
    - [x] Required checks reference command
    - [x] Tag increment release command
  - ACs:
    - [x] Commands appear under `/` and mirror `.cursor/rules/trunk-preview.mdc`
    - [x] Each command includes actionable steps and a checklist
  - Tests (TDD): N/A (docs/agent integration); manual verify commands list and content
  - Steps: add `.cursor/commands/trunk-*.md` and `.cursor/commands/preview-*.md`
  - Estimate: XS
  - Status: Done

- Effort: Collaboration Commands
  - Tasks:
    - [x] Add `/kowalski` sounding-board ideation command
  - ACs:
    - [x] Command appears under `/` and is clearly ideation-only (no deliverables)
    - [x] Includes framing guidance, modes, outputs, prompts, and checklist
  - Tests (TDD): N/A (doc-only)
  - Steps: add `.cursor/commands/kowalski.md`
  - Estimate: XS
  - Status: Done

## Scope Fence (Out of Scope)

- Advanced editor QoL (formatting/folding), realtime multi-user collaboration, advanced adapters, Code Node runtime preview, and non-MVP plane/library features.

## Exit Criteria

- All ACs satisfied; tests pass; demo shows create→wire→preview→undo/redo→export→save/load end-to-end.
- Status: In progress
