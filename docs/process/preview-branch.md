# Preview Integration Branch

- Integration branch per increment: `preview/<increment>` (e.g., `preview/pi-3`).
- Add label `include-in-preview` to PRs you want composed.
- Run the Action with `increment=pi-3` or wait for the schedule.
- Conflicts? The Action comments on the PR → rebase on `main`.
- Deploy runs on pushes to `preview/**` (wire your command).
- Done? Merge PRs → tag `pi-3.0.0` → delete `preview/pi-3`.
