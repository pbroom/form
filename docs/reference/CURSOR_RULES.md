# Cursor Rules – Trunk + Preview Integration

## Branches

- Work from `main`; name branches `feat/pi-<n>-<slug>`, `fix/pi-<n>-<slug>`, etc.
- Keep PRs small (≤ ~400 LOC).

## PRs

- Target `main`. Use the PR template; link Charter & Log.
- Add labels: `include-in-preview` (+ `increment:pi-<n>`).

## Preview

- Run workflow **Build Preview Integration Branch** with `increment=pi-<n>`.
- Don’t push directly to `preview/*` (automation only).

## Exit

- After preview validation, squash-merge PRs to `main`, then tag `pi-<n>.0.0`.
