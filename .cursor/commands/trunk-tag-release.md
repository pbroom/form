# /trunk-tag-release — Tag increment release after merge

## Overview

After preview validation and squash-merge to `main`, tag the increment release.

## Steps

1. Verify preview validation complete and PRs merged.
2. On `main`, create and push tag:
   - Command: `git tag pi-<n>.0.0 && git push origin pi-<n>.0.0`

## Checklist

- [ ] Preview validated
- [ ] Squash-merged to `main`
- [ ] Tag `pi-<n>.0.0` pushed

## References

- `.cursor/rules/trunk-preview.mdc`
