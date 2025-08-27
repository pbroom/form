# Increment Charter – pi-1

## Context Capsule

- Aim: Ship the smallest end-to-end slice: create scene → wire nodes → live preview → export code → save/load.
- Guardrails: Determinism in emitted code; no inline node controls; IR as source of truth.

## Focus (What we ship)

- Box scene quickstart powered by IR; deterministic TSX emitter; basic project round-trip; curated adapter subset.

## Prioritized Acceptance Criteria (Cornerstones)

- Node graph: create/select node; connect edge with `targetHandle`; params update viewport + state; inputs hidden unless connected; generic input optional
- IR: schema-validated; deterministic serialization; safe ops
- Codegen: deterministic TSX with fenced regions; typechecks
- Project file: save → load round-trip
- Adapter v1: ≥5 drei nodes visible and usable
- E2E: quickstart flow renders and exports stable code

## Efforts

- Effort: Node Graph Essentials

  - Tasks:
    - [x] Command palette create/select (G1)
    - [x] Edge connect + `targetHandle` mapping (G2)
    - [x] Params update viewport + state (G3)
    - [x] Hidden inputs + optional generic input (G4)
  - ACs: See Acceptance Criteria doc §1
  - Tests (TDD): Playwright tests for G1–G4
  - Steps: Implement UI behaviors; data-testid for selectors
  - Estimate: M
  - Status: Done

- Effort: IR Core

  - Tasks:
    - [x] Types + Zod schemas (IR1)
    - [x] Immutable ops add/connect/setProp (IR2)
    - [x] Deterministic serialize (IR3)
  - ACs: See §2
  - Tests: Unit (schema pass/fail), ops invariants, snapshot JSON
  - Steps: Add `src/lib/ir/{types,schema,ops}.ts`
  - Estimate: M
  - Status: Done

- Effort: Codegen (React/R3F)

  - Tasks:
    - [x] Minimal emitter with fences (CG1)
    - [x] Typecheck emitted module (CG2)
  - ACs: See §4
  - Tests: Snapshot TSX; `tsc --noEmit` on output
  - Steps: `src/lib/codegen/react/index.ts` walk TreeLayer
  - Estimate: M
  - Status: Done

- Effort: Project Save/Load

  - Tasks:
    - [x] Save → Load round-trip service (PF1)
  - ACs: See §5
  - Tests: Unit round-trip; e2e stub
  - Steps: `src/lib/project/{save,load}.ts`
  - Estimate: S
  - Status: Done

- Effort: Adapter v1 (drei subset)

  - Tasks:
    - [x] Template schema + validation (AD1)
    - [x] Curated subset (≥5) + mapper (AD2)
  - ACs: See §3
  - Tests: Schema validation; palette count; mapping unit
  - Steps: `scripts/adapters/generate-drei.ts`, `generated/*.registry.json`
  - Estimate: M
  - Status: Done

- Effort: E2E Quickstart
  - Tasks:
    - [x] Flow: quickstart → render → export code (E2E1)
  - ACs: See §9
  - Tests: Playwright script + code snapshot
  - Steps: Compose previous efforts into e2e
  - Estimate: M
  - Status: Done

## Scope Fence (Out of Scope)

- Three.js imperative emitter; advanced type coercions; realtime collaboration

## Exit Criteria

- All cornerstones’ tests pass; demo video/screenshot of quickstart; emitted TSX snapshot stable

Status: Done
