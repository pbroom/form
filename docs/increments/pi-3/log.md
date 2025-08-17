# Increment Log – PI-3

_Code Node: author functions in-editor with typed sockets and metadata-driven UI; properties panel integration and safe runtime preview_

## Entry 1

Re-scoped PI-3 to focus on a first-class Code Node and its integration with the properties panel and codegen.

- Action: Updated PI-3 charter: added efforts for domain model, code panel, type extraction, sandboxed execution, codegen integration, persistence, and validation
- Files/Areas: `docs/increments/pi-3/charter.md`, `docs/increments/pi-3/log.md`
- Decisions: Keep IR as source of truth; sandbox execution; primitives-focused type extraction in PI-3; defer Monaco/editor polish
- Issues/Risks: Parser complexity and sandbox safety; need deterministic codegen and typecheck; UX validation messaging
- Learnings: Code Node provides a forcing function to harden typing, validation, and UX cohesion across panels
- Tests/Artifacts: Charter ACs and TDD hooks specified; templates planned; round-trip tests to be added

## Entry 2

Updated PI-2 docs to reflect completed scope and captured closure details in project log.

- Action: Added PI-2 log entry summarizing stabilization and documentation close; updated project log with real date, corrected spelling, and decisions on adapter merge order; reconciled PI-2 charter Focus and Cornerstones with shipped features
- Files/Areas: `docs/increments/pi-2/log.md`, `docs/increments/pi-2/charter.md`, `docs/project-log.md`
- Decisions: Treat PI-2 as complete with Advanced Parameter & Value Flow efforts as core; maintain strict connection-driven semantics and custom-over-generated registry precedence
- Issues/Risks: Future registry regenerations could regress merge-order—consider a test to lock behavior
- Learnings: Increment closure requires aligning charter, log, and project log for accurate historical record
- Tests/Artifacts: 47 unit tests passing per PI-2 closure entry; documentation updated

## Entry 3

Revised PI-3 scope around Code Node creation, typing, properties integration, and safe runtime/codegen.

- Action: Appended Code Node-focused efforts, ACs, TDD hooks, and scope fence to charter
- Files/Areas: `docs/increments/pi-3/charter.md`, `docs/increments/pi-3/log.md`
- Decisions: Sandbox execution; primitives-first type extraction; keep IR as source of truth; minimal editor this increment
- Issues/Risks: Parser coverage and performance; ensuring deterministic codegen and typecheck
- Learnings: Code Node aligns UX of nodes and properties, forcing consistent metadata-driven rendering
- Tests/Artifacts: To add: parser unit tests, sandbox timeout tests, project round-trip for Code Node, TSX snapshot

## Entry 4

Separated Code View from properties panel and positioned it as a standalone, full-height resizable panel with editor QoL.

- Action: Updated PI-3 charter to reflect a standalone `CodeViewPanel` to the left of properties; specify CodeMirror syntax highlighting and QoL features
- Files/Areas: `docs/increments/pi-3/charter.md`, `docs/increments/pi-3/log.md`
- Decisions: Use CodeMirror for PI-3; keep code editing outside properties during development; maintain metadata editing in code view
- Issues/Risks: Additional layout complexity; dependency footprint; need to preserve performance with large code
- Learnings: Decoupling code authoring from parameter UI clarifies responsibilities and accelerates iteration
- Tests/Artifacts: To add e2e for layout and persistence of panel size; unit tests for debounced validation

## Entry 5

Deprioritized persistence/templates; added click→click connection UX with searchable parameter chooser via Shadcn Command.

- Action: Updated charter ACs and added new effort for click→click connect with compatible-parameter search
- Files/Areas: `docs/increments/pi-3/charter.md`, `docs/increments/pi-3/log.md`
- Decisions: Keep drag-to-connect; add pending-connection state for click flow; filter by type compatibility; keyboard-first navigation
- Issues/Risks: State machine complexity; ensuring no interference with existing drag behaviors
- Learnings: Click-first workflows reduce cognitive load and improve accessibility
- Tests/Artifacts: To create Playwright tests for click→click flow; unit tests for type filtering and pending state transitions
