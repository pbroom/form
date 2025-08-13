# Increment Method (Lean TDD for Humans + LLMs)

A lightweight structure to drive incremental, measurable progress without heavy process. Two artifacts per increment:

- Increment Charter (IC): source-of-truth plan for the increment
- Increment Log (IL): short running log after each meaningful change (commit/PR/LLM update)

## Goals

- Preserve necessary context for deep-dives while trimming irrelevant detail
- Make progress measurable with test-first (TDD) ACs
- Enable any human/agent to resume quickly

## Naming

- Increments: `pi-1`, `pi-2`, ...
- Files: `docs/increments/pi-1/charter.md`, `docs/increments/pi-1/log.md`

## Increment Charter (IC)

Contains:

- Context Capsule: high-level aim + constraints to keep efforts aligned
- Focus: 1–2 sentences describing the slice we’re shipping
- Prioritized ACs: cornerstone acceptance criteria for the slice
- Efforts: list of efforts; for each: tasks, ACs, tests (TDD), steps, estimate (S/M/L), status checklist
- Scope Fence: what is intentionally out-of-scope for this increment
- Exit Criteria: what makes the increment done (all tests pass; demoable)

## Increment Log (IL)

- Each entry starts with a 1–2 sentence Summary in plain, concise English
- Short bullets: action, files touched, decisions, issues, learnings, tests/artifacts
- Keep it terse; 3–6 bullets per entry

## TDD Loop (for each task)

1. Define/confirm ACs and tests
2. Write tests/fixtures (fail)
3. Implement minimal code
4. Make tests pass; refactor
5. Update IC status; add IL entry (include links/screens)

## Context Management

- IC holds the current “context capsule” – copy forward and prune each increment
- IL references decisions; only key decisions graduate into ADRs (optional)

## Templates

See `docs/increments/_templates/charter.template.md` and `docs/increments/_templates/log.template.md`.
