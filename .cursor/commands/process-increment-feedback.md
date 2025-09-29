# /process-increment-feedback — Increment Feedback Processing

Use this when providing feedback during an increment. The flow:

- Context Analysis → Categorization → Priority → Integration Strategy.
- Update Charter/PRD/backlog if relevant (Effort/Tasks/ACs/Tests/Steps/Status where applicable).
- Append an IL entry noting assessment and any changes.
- Use absolute paths and non-interactive flags; wrap placeholders in backticks.

## Checklists

### Feedback Intake Checklist

- [ ] Feedback categorized (e.g., bug, scope change, UX, docs)
- [ ] Priority determined (now/next/later)
- [ ] Integration strategy defined
- [ ] Charter/PRD/backlog updated if relevant
- [ ] Impacted Efforts’ Tasks/ACs/Tests/Steps/Status updated

### Post-Action Checklist

- [ ] IL entry appended with assessment and any changes
- [ ] Links to updated files included
- [ ] Follow-up todos created if needed

References:

- Increment rules: `.cursor/rules/increments.mdc`
- Docs: `https://cursor.com/docs/agent/chat/commands`
- Changelog: `https://cursor.com/changelog`
