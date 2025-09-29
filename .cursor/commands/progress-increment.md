# /progress-increment — Increment Method Execution

Use this command to run the Increment Method end-to-end for the prompt you provide after invoking `/p`.

Steps:

- Select CURRENT increment (lowest `pi-N` in `docs/increments/` whose `charter.md` does not contain `✅ Done` or `Status: Done`).
- Link absolute paths to the CURRENT increment’s `charter.md` and `log.md`.
- Summarize the user prompt into a one-paragraph plan aligned to the Charter `Focus`.
- If scope changes, update the Charter (Effort/Tasks/ACs/Tests/Steps/Status).
- Run the TDD Loop:
  - Confirm/define ACs + tests in Charter for the relevant Effort.
  - Write failing tests first.
  - Implement minimally.
  - Make tests pass; refactor.
- Post-Action Sync:
  - Update the Charter (toggle tasks; update ACs/Tests/Steps; Effort Status).
  - Append an IL entry to `log.md` (Summary + 3–6 bullets: Action, Files/Areas, Decisions, Issues/Risks, Learnings, Tests/Artifacts).
  - Run unit tests via `pnpm test -- tests/unit/` and record a one-line result (e.g., “64 passed, 0 failed”). If failures remain and aren’t trivial, stop and record failing test names.

Guardrails:

- Use absolute paths within `/Users/peterbroomfield/form`.
- Non-interactive flags only; avoid pagers.
- Wrap placeholders in backticks.
- If multiple increments appear active, pick the lowest `pi-N` and note ambiguity in IL.

## Checklists

### Pre-Flight Checklist

- [ ] CURRENT increment selected and absolute links to `charter.md` and `log.md` included
- [ ] One-paragraph plan aligns to Charter `Focus`
- [ ] Scope changes reflected in Charter (Effort/Tasks/ACs/Tests/Steps/Status)

### TDD Loop Checklist

- [ ] ACs + tests defined/confirmed in Charter for the relevant Effort
- [ ] Failing tests written first
- [ ] Minimal implementation completed
- [ ] Tests pass; refactor done

### Post-Action Sync Checklist

- [ ] Charter updated (tasks toggled; ACs/Tests/Steps and Effort Status updated)
- [ ] IL entry appended with: Action, Files/Areas, Decisions, Issues/Risks, Learnings, Tests/Artifacts
- [ ] Unit tests run: `pnpm test -- tests/unit/` and one-line result recorded
- [ ] Non-trivial failures recorded with failing test names; further work paused

### Guardrails Checklist

- [ ] Absolute paths used within `/Users/peterbroomfield/form`
- [ ] Non-interactive flags only; avoid pagers
- [ ] Placeholders wrapped in backticks
- [ ] If multiple increments appear active, lowest `pi-N` chosen and ambiguity noted in IL

References:

- Increment rules: `.cursor/rules/increments.mdc`
- Docs: `https://cursor.com/docs/agent/chat/commands`
- Changelog: `https://cursor.com/changelog`
