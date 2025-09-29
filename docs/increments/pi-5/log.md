# Increment Log – pi-5

## Entry 1

Initialized increment to track Monaco editor node selection bugfix.

- Action: Create pi-5 charter and log from templates
- Files/Areas: docs/increments/pi-5/charter.md, docs/increments/pi-5/log.md
- Decisions: Track as separate increment for clear scope
- Issues/Risks: None yet
- Learnings: Bug likely due to shared Monaco model across nodes
- Tests/Artifacts: None yet

## Entry 2

Added per-node `key` to `CodeView` to force remount on selection changes.

- Action: Remount editor per node to prevent model reuse
- Files/Areas: src/components/PropertiesPanel.tsx
- Decisions: Use React `key` to create isolated Monaco model per node
- Issues/Risks: Slight remount cost on selection; acceptable
- Learnings: Stable URI and model reuse caused cross-node value bleed
- Tests/Artifacts: Manual repro fixed; will run vitest next

## Entry 3

Ran unit test suite; all tests passed.

- Action: Execute `pnpm test -- tests/unit/`
- Files/Areas: tests/unit
- Decisions: No e2e run needed for this small fix right now
- Issues/Risks: None observed
- Learnings: Existing unit coverage unaffected by editor remount
- Tests/Artifacts: 18 files passed, 64 tests passed
