# /trunk-submit-pr-and-label — Submit PR and apply preview labels

## Overview

Submit the current PR (or stack) and apply labels for preview composition.

## Steps

1. Submit the current PR (non-interactive):
   - Command: `gt submit --no-interactive`
2. Get PR number for the current branch:
   - Command: `gh pr view --json number --jq .number`
3. Apply labels:
   - Command: `gh pr edit <prNumber> --add-label include-in-preview --add-label increment:pi-<n>`

## Checklist

- [ ] Branch is up to date with `main`
- [ ] PR is draft until checks are green
- [ ] Labels `include-in-preview` and `increment:pi-<n>` applied
- [ ] PR description complete and links Charter/Log

## References

- `.cursor/rules/trunk-preview.mdc`
