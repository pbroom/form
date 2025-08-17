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
- Predominent agent model used: gpt-5

## Entry: PI-2 (2025-08-16)

- Summary: Expanded foundation to emit realistic, parameterized scenes with connection-driven rendering, automated adapter generation, and comprehensive parameter system. Bridged gap between basic box demo and genuine usable tool.
- Artifacts:
  - Increment Charter: `docs/increments/pi-2/charter.md`
  - Increment Log: `docs/increments/pi-2/log.md`
- Major efforts and status:
  - TreeLayer Codegen Walker (CG3–CG6): dependency-ordered JSX generation with real props: done
  - Connection-Driven Viewport Integration (VP1–VP5): scene graph hierarchy with Camera→Scene→Render flow: done
  - Automated Adapter Generation (AD3–AD6): 19 drei components via package introspection: done
  - Advanced Parameter & Connection System (AP1–AP5): smart connections, dynamic controls, parameter validation: done
  - Parameter Value Flow & Primitive Nodes: constant nodes, math transforms with recursive evaluation: done
  - Graph Validation & Type Safety (GV1–GV4): type-aware validation preventing invalid graph states: done
- Tests (at close): 47 unit tests (6 new math node tests), comprehensive validation coverage
- Decisions:
  - Connection-driven semantics essential for node graph editors; zero tolerance for legacy fallbacks
  - Automated generation more reliable than manual curation; parameter inference patterns work well
  - Math node chaining requires careful recursive evaluation; value propagation at IR-construction time
- Learnings:
  - Strict connection-driven approach needs good defaults to prevent user friction
  - Light detection requires full connectivity analysis; consistent semantics crucial for user experience
  - Validation must align with actual runtime node definitions from adapter registry
- Risks/Next:
  - Scene templates and quickstart workflows (deferred to focus on core parameter system)
  - Professional UX interactions and foundational node organization (planned for PI-3)
- Predominant agent model used: gpt-5
- Additional decisions at close:
  - Adapter registry merge-order fix: ensure base/custom node definitions override generated drei entries to preserve granular parameters (e.g., box)
