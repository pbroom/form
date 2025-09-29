# /trunk-create-stacked-pr — Create stacked PR (Graphite)

## Overview

Create a focused, testable stacked PR for the current increment using Graphite.

## Steps

1. Ensure branch naming follows the rule: `feat/pi-<n>-<slug>` (or `fix/chore/spike`).
2. Create a PR for the current changes:
   - Command: `gt create -m "feat(pi-<n>): <scope>"`
3. Push branch if needed:
   - Command: `git push -u origin HEAD`
4. Keep PR as draft until checks are green.
5. Link the Increment Charter and Log in the PR description.

## Checklist

- [ ] Branch name matches `feat/pi-<n>-<slug>`
- [ ] Commit/PR message uses `feat(pi-<n>): <scope>`
- [ ] PR is focused (cohesive, demoable)
- [ ] Charter & Log links included
- [ ] Demo/validation steps included

## References

- `.cursor/rules/trunk-preview.mdc`
- Charter/Log path: `docs/increments/pi-<n>/{charter.md,log.md}`
