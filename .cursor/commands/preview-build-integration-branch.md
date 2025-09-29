# /preview-build-integration-branch — Run preview integration workflow

## Overview

Compose the preview branch from labeled PRs using the GitHub workflow.

## Steps

1. Ensure PRs have `include-in-preview` and `increment:pi-<n>` labels.
2. Trigger the workflow from terminal:
   - Command: `gh workflow run "Build Preview Integration Branch" -f increment=pi-<n> -f include_label=include-in-preview`
3. Monitor the workflow in Actions UI; do not push directly to `preview/*`.

## Checklist

- [ ] All relevant PRs labeled correctly
- [ ] Workflow run triggered with correct `increment` value
- [ ] No direct pushes to `preview/*`

## References

- `.cursor/rules/trunk-preview.mdc`
