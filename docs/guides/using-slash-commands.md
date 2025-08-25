# Using Custom Slash Commands (Cursor)

This guide shows how to use the custom slash commands defined in `.cursor/rules/increments.mdc` to operate the Increment workflow.

## Prerequisites

- Using Cursor editor with the workspace open
- File present: `.cursor/rules/increments.mdc`

## Current Increment Identification

**Important:** Always check which increment is current before using commands!

- **Current increment** = earliest increment **not marked as Done** in its charter
- Commands like `/il log` and `/effort status` operate on the current increment
- Check `docs/increments/pi-X/charter.md` files for status indicators:
  - ✅ Done = completed increment
  - 🔄 In progress = current increment
  - 📋 Draft = future increment

Example: If PI-1 and PI-2 are ✅ Done, then PI-3 is current (even if it shows "Not started")

## Core commands

- `/pi <id> init <focus>`

  - Scaffolds `docs/increments/<id>/charter.md` and `docs/increments/<id>/log.md` from templates
  - Sets the Focus in the charter and links the pages in the docs sidebar
  - Example: `/pi pi-2 init Minimal IR + Emitter`

- `/pi <id> set-goal <aim>`

  - Updates the Increment Charter’s Context Capsule Aim
  - Example: `/pi pi-2 set-goal Ship deterministic TSX for a basic scene`

- `/effort add <title>`

  - Appends an Effort block to the current increment’s charter
  - Example: `/effort add Node Graph Essentials`

- `/effort task add <effort-title> <task-text>`

  - Adds a checkbox task under the given Effort
  - Example: `/effort task add Node Graph Essentials Implement edge connect mapping`

- `/effort status <effort-title> <status>`

  - Sets Effort status: `Not started | In progress | Blocked | Done`
  - Example: `/effort status Node Graph Essentials In progress`

- `/il log <summary>`

  - Appends a new entry to the current increment log with action summary and contextual fields
  - Example: `/il log Connected Scene→Box; added targetHandle mapping`

- `/ac list cornerstone`

  - Summarizes cornerstone ACs relevant to the current increment Focus

- `/tdd plan <effort-title>`

  - Generates a minimal TDD plan (tests-first) and inserts it under the Effort
  - Example: `/tdd plan Codegen (React/R3F)`

- `/test gen playwright <name>`

  - Creates a Playwright test skeleton under `tests/e2e/<name>.spec.ts`
  - Example: `/test gen playwright quickstart.spec`

- `/run core`

  - Proposes and runs core build/test commands non-interactively (`npm run -s build`, optionally `npm test`)

- `/emit react <module>`

  - Emits React/R3F TSX for an IR module to `generated/<module>.tsx`, fences regions, runs typecheck

- `/p -f <feedback>`

  - Submit feedback, concerns, or feature requests for contextual assessment
  - Does not immediately act on feedback; instead evaluates it against current project state
  - Provides integration recommendations while preserving current increment focus
  - Example: `/p -f I think we need better error handling in the viewport when nodes fail to render`

- `/pi <id> complete`
  - Marks the specified increment as ✅ Done in its charter
  - Updates project log with increment summary
  - Example: `/pi pi-2 complete`

## Tips

- Use short, specific effort titles to keep the charter organized
- After each significant edit, log with `/il log ...` so future sessions can resume quickly
- Prefer adding ACs/tests before implementing; use `/tdd plan` to seed steps
