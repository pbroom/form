# ADR 0001: Docs-as-code with VitePress and TypeDoc

Date: 2025-08-11

## Status

Accepted

## Context

We need project documentation that lives alongside code, supports PR review, and can publish a small site.

## Decision

- Use VitePress + MDX-flavored Markdown for the docs site
- Generate API reference with TypeDoc
- Keep ADRs in `docs/adr/`

## Consequences

- Docs built in CI
- Contributors update docs in the same PRs as code changes
