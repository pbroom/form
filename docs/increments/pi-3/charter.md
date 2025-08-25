# Increment Charter – PI-3

## Context Capsule

- Aim: Ship a first-class "Code Node" that users can create, author in-editor, and wire into the graph with typed sockets and metadata-driven UI. This establishes the procedural bridge between authored code and nodes + properties panel.
- Constraints/Guardrails: Deterministic emission and type safety; sandboxed execution with timeouts; no third-party imports or side effects; IR remains source of truth; follow existing adapter/schema patterns; use a lightweight embedded editor (CodeMirror) for syntax highlighting and QoL, defer Monaco-level advanced type tooling.

## Focus (What we ship)

- A minimal-but-complete Code Node that users can: create, define its underlying function, declare its type signature and metadata, auto-generate sockets, and edit parameters via the properties panel. It interoperates with existing nodes and participates in codegen and validation.

## Prioritized Acceptance Criteria (Cornerstones)

- [ ] Create Code Node from palette; selecting it shows a dedicated Code tab in properties
- [ ] In-editor code panel accepts a single exported function with typed inputs/outputs
- [ ] Type extraction maps function signature to sockets (inputs → target params, output → source). Code Node always has a single source/out port; input ports are 100% dynamic from code
- [ ] Metadata block configures label, appearance, parameter UI hints, defaults, and validation
- [ ] Properties panel auto-renders controls from extracted types/metadata
- [ ] Type-aware connections enforced (cannot connect incompatible sockets)
- [ ] Safe runtime preview: executing function with current inputs yields output value without blocking UI
- [ ] Codegen includes Code Node function and wires props deterministically; typechecks
- [ ] Click → click connection UX: clicking a source handle, releasing, then clicking a target node's input handle opens a searchable chooser of compatible parameters; selecting one creates the connection without dragging

## Efforts

- Effort: Code Node Domain Model & Schema

  - Tasks:
    - [ ] Extend IR and node-registry to support `code` nodes with code string, version, and metadata
    - [ ] Define Zod schema for Code Node (function source, signature, sockets, uiHints)
    - [ ] Add mapper to transform Code Node into runtime/evaluation form
  - ACs:
    - [ ] IR validates Code Node instances and rejects invalid metadata/signatures
    - [ ] Registry exposes Code Node definition with appearance and default template
  - Tests (TDD): Schema pass/fail; IR ops invariants for add/update/remove; snapshot of serialized Code Node
  - Steps: IR types → Zod schema → registry entry → mapper integration
  - Estimate: M
  - Status: In progress

- Effort: Code View Panel (Standalone) & Properties Integration

  - Tasks:
    - [ ] Introduce a standalone `CodeViewPanel` component mounted to the right sidebar
    - [ ] Place `CodeViewPanel` to the left of the properties panel in a full-height resizable layout
    - [ ] Integrate CodeMirror with TypeScript/JavaScript syntax highlighting, line numbers, folding, bracket matching, search
    - [ ] Provide template insertion for starter function + metadata; debounced onChange with validation feedback
    - [ ] Keep properties panel focused on parameter UI; code view remains separate while developing
  - ACs:
    - [ ] Code view is a full-height resizable panel positioned left of the properties panel
    - [ ] Syntax highlighting and expected editor QoL (line numbers, folding, bracket matching, search) are available
    - [ ] User can edit code and metadata with immediate validation signals in the code view
    - [ ] Errors surface in the code view without breaking the graph
  - Tests (TDD): UI render test for Code tab; debounced onChange unit; validation message rendering
  - Steps: Properties panel tab → editor component → validation plumbing → UX polish
  - Estimate: M
  - Status: In progress
  - Notes:
    - Added shared `initialNodes` module for editor initialization reuse in V2 editor

- Effort: Type Extraction & Socket Generation

  - Tasks:
    - [ ] Use TypeScript compiler API (or lightweight parser) to extract function inputs/outputs
    - [ ] Map extracted inputs to dynamic target handles; maintain a single always-present source handle
    - [ ] Support primitives (number, string, boolean), arrays, tuples, and Vector-like structs
    - [ ] Generate UI control hints from metadata (ranges, enums, color, step)
  - ACs:
    - [ ] Sockets appear/refresh after code changes; labels and types match signature
    - [ ] Unsupported types produce actionable errors and block invalid sockets
  - Tests (TDD): Parser unit tests across type matrix; socket generation snapshots; error cases
  - Steps: Parse → normalize types → build param/socket model → integrate with properties
  - Estimate: L
  - Status: In progress

- Effort: Safe Runtime Preview (Sandboxed Execution)

  - Tasks:
    - [ ] Evaluate function in a sandbox with time budget and exception capture
    - [ ] Compute output for current input values; expose as source socket value
    - [ ] Provide clear error states and disable output when execution fails
  - ACs:
    - [ ] Infinite loops/timeouts do not freeze UI; errors are captured and shown
    - [ ] Output updates deterministically on input change
  - Tests (TDD): Timeout tests; error propagation unit; deterministic value update tests
  - Steps: Sandbox wrapper → schedule/debounce → error UI → output propagation
  - Estimate: M
  - Status: Not started

- Effort: Codegen Integration for Code Node

  - Tasks:
    - [ ] Extend React emitter to include user function and wire outputs/props
    - [ ] Generate imports/types only when referenced; fenced regions remain deterministic
    - [ ] Typecheck emitted module including Code Node
  - ACs:
    - [ ] Emitted TSX compiles under `tsc --noEmit`
    - [ ] Snapshot stable given identical Code Node source
  - Tests (TDD): TSX snapshot tests; `tsc` typecheck step; integration scene containing Code Node
  - Steps: Emitter extension → import management → typecheck integration → snapshots
  - Estimate: M
  - Status: Not started

- Effort: Connection UX – Click→Click with Searchable Parameter Chooser

  - Tasks:
    - [ ] Support click-and-release on a source handle to set a pending connection
    - [ ] Render a low-opacity dashed ghost wire from source handle to cursor while pending
    - [ ] Clicking a target node's input handle opens a Shadcn Command-based searchable list of compatible parameters
    - [ ] Filter parameters by type compatibility; show labels, groups; keyboard navigation (search, arrows, enter)
    - [ ] Selecting a parameter creates edge with `targetHandle` set; cancel clears pending state (Esc/click-outside)
    - [ ] Preserve existing drag-to-connect behavior; generic target handle supported
    - [ ] Add `data-testid` hooks for E2E
  - ACs:
    - [ ] No drag required: click source, release; click target → chooser appears and connects on selection
    - [ ] A ghost wire follows the cursor between clicks at ~40–50% opacity and dashed style
    - [ ] Pressing Esc at any time during pending state cancels it and removes the ghost wire
    - [ ] Only compatible parameters are shown; search filters list; keyboard and mouse supported
    - [ ] Edge is created deterministically with correct `targetHandle`; cancel restores neutral state
  - Tests (TDD): Playwright flow tests for click→click connect; unit tests for type filter and pending-connection state machine
    - [ ] e2e: drag preview path visible during drag; ghost preview visible after click; Esc cancels and hides preview
  - Steps: Pending state → handle event wiring → Shadcn Command chooser → type filter → edge creation → UX polish
  - Estimate: M
  - Status: Not started

- Effort: Interoperability & Validation

  - Tasks:
    - [ ] Enforce type-compatible connections with existing nodes
    - [ ] Add graph-level validation messages for Code Node socket types
  - ACs:
    - [ ] Cannot connect incompatible types; helpful error shown
  - Tests (TDD): Connection validation unit/e2e; properties panel control mapping tests
  - Steps: Validation rules → connection guardrails → e2e wiring scenarios
  - Estimate: M
  - Status: Not started

## Scope Fence (Out of Scope)

- Project persistence of Code Node and starter templates (deferred to next increment)
- Multi-file modules, external package imports, async I/O, and side effects
- Arbitrary global state mutation or DOM/Three access from user code
- Advanced generics/conditional types; complex inference beyond primitives/tuples/simple structs
- Full Monaco integration, code formatting, or lint rulesets (keep minimal editor for PI-3)
- Node-to-code reverse import pipeline (future increment)

## Exit Criteria

- ✅ Create/edit/persist a Code Node with function + metadata; sockets auto-generated
- ✅ Properties panel renders controls per metadata and stays in sync with code
- ✅ Safe runtime preview updates deterministically and never freezes UI
- ✅ Codegen outputs valid, typechecked TSX including Code Node
- ✅ Type validation prevents incompatible connections
- ✅ Interoperates with existing nodes in at least two scenes (number transform; vec3 mixer)
- ✅ Click→click connection UX with searchable compatible parameter chooser is implemented and tested
