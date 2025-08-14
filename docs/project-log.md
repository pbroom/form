# Project Log – Form

A human-readable, increment-level project log. Updated at the close of each increment to capture outcomes, artifacts, and decisions at a glance. For in-flight notes, see each increment’s `log.md`.

## Entry: PI-1 (2025-08-14)

- Summary: Shipped the smallest end-to-end slice: create scene → wire nodes → live preview → export code → save/load. Established IR Core, minimal React/R3F emitter with fenced regions, and an adapter v1 curated subset exposed in the palette. Recorded demo video of export flow.
- Artifacts:
  - Increment Charter: `docs/increments/pi-1/charter.md`
  - Increment Log: `docs/increments/pi-1/log.md`
  - Demo video: `test-results/demo/export-code-export-code-shows-fenced-regions-and-component/video.webm`
- Major efforts and status:
  - Node Graph Essentials (G1–G4): done
  - IR Core (IR1–IR3): types, schemas, ops, deterministic serialization: done
  - Codegen (CG1–CG2): minimal R3F emitter with fenced regions + typecheck: done
  - Project Save/Load (PF1): deterministic round-trip: done
  - Adapter v1 (AD1–AD2): schema + curated subset + palette insertion: done
  - E2E Quickstart (E2E1): flow renders and exports code: done
- Tests (at close): 7 unit tests passing; 13 e2e tests passing
- Decisions:
  - Use Zod for runtime validation; Vitest for unit isolation from Playwright
  - Deterministic ordering via id/name for stable JSON/TSX snapshots
  - Curated drei subset in palette for stability in PI-1; automate generation later
- Learnings:
  - Fenced-region emitter pattern simplifies future round-trip
  - Simple minimap anchoring benefits from integer snapping and zero-duration snaps for e2e stability // but usability takes a hit; retaining animations long-term
- Risks/Next:
  - Expand codegen to walk TreeLayer and emit parameterized scene
  - Automate adapter generation pipeline and broaden coverage
