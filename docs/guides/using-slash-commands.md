# Using Custom Slash Commands (Cursor)

This guide shows how to use the custom slash commands defined in `.cursor/rules/increments.mdc` to operate the Increment workflow.

## Prerequisites

- Using Cursor editor with the workspace open
- File present: `.cursor/rules/increments.mdc`

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

## Tips

- Use short, specific effort titles to keep the charter organized
- After each significant edit, log with `/il log ...` so future sessions can resume quickly
- Prefer adding ACs/tests before implementing; use `/tdd plan` to seed steps
