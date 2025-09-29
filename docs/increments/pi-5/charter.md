# Increment Charter – pi-5

## Context Capsule

- Aim: Fix Monaco code editor state bleeding across node selection.
- Constraints/Guardrails: Minimal surface change; preserve existing UX and styling.

## Focus (What we ship)

- Bugfix: Code editor shows correct code for the currently selected node and does not overwrite other nodes' code when reselecting.

## Prioritized Acceptance Criteria (Cornerstones)

- Selecting nodes swaps editor content to the correct node’s code immediately.
- Reselecting a previously selected node preserves that node’s unique code content.
- Typing in one node’s editor does not update other nodes’ code.
- All existing tests pass.

## Efforts

- Effort: Editor model lifecycle fix

  - Tasks:
    - [x] Remount editor per node selection to ensure isolated models
    - [x] Wire `key` on CodeView to `node.id` and ensure value sync
  - ACs:

    - [ ] Editor content matches `useCodeStore.getCode(node.id)` after each selection
    - [ ] No cross-node code leakage when switching selections

  - ## Tests (TDD)

  - Manual repro steps; run vitest suite

  - ## Steps

  - Add `key` prop to `CodeView` container driven by `node.id`
  - Keep model value in sync via `value` prop; rely on store updates

  - Estimate: S
  - Status: Done

## Scope Fence (Out of Scope)

- Broader refactors to node graph or store architecture

## Exit Criteria

- ACs met; tests green; IL updated; charter marked Done
