# /trunk-restack — Restack PRs when main moves

## Overview

Keep stacked PRs current with `main`, resolving conflicts at the lowest PR possible.

## Steps

1. Restack the current stack:
   - Command: `gt restack`
2. Resolve conflicts starting from the lowest PR; re-run checks.
3. Push updates as needed.

## Checklist

- [ ] Restack completed without unresolved conflicts
- [ ] Conflicts fixed at the lowest PR
- [ ] Checks re-run and green

## References

- `.cursor/rules/trunk-preview.mdc`
