# Increment Charter – PI-4

## Context Capsule

- Aim: Progress Code Node to a shippable state with safe runtime preview and initial codegen integration while polishing click→click UX.
- Constraints/Guardrails: Preserve determinism, type safety, and adapter/IR contracts. Keep editor QoL scoped.

## Focus (What we ship)

- Minimal shippable Code Node: evaluate function safely, dynamic input sockets from signature (primitives), output port wired; integrate into codegen minimally.

## Prioritized Acceptance Criteria (Cornerstones)

- [ ] Safe runtime preview executes user function with timeout and error capture
- [ ] Dynamic input sockets derived from function params (primitives) refresh on code change
- [ ] Emitted TSX includes Code Node output wiring and typechecks (noEmit)
- [ ] Click→click chooser stable with tests in PW runner

## Efforts

- Effort: Sandbox Runtime

  - Tasks:
    - [ ] Timeout/abort controller; error surface
    - [ ] Deterministic execution with provided inputs
  - ACs:
    - [ ] No UI freeze; errors captured
  - Tests (TDD): Timeout/error tests
  - Steps: wrapper → scheduler → UI
  - Estimate: M
  - Status: Not started

- Effort: Dynamic Sockets from Signature (Primitives)

  - Tasks:
    - [ ] Integrate parser into node definition → target handles
    - [ ] Refresh sockets on code change; persist params
  - ACs:
    - [ ] Inputs match signature; invalid types blocked
  - Tests (TDD): parser integration; snapshots
  - Steps: parse → normalize → apply
  - Estimate: M
  - Status: Not started

- Effort: Codegen Integration (Minimal)

  - Tasks:
    - [ ] Emit function and wire output prop
    - [ ] Ensure imports/types only when referenced
  - ACs:
    - [ ] tsc noEmit passes
  - Tests (TDD): snapshot + typecheck
  - Steps: emitter ext → imports → typecheck
  - Estimate: S
  - Status: Not started

- Effort: Click→Click UX hardening
  - Tasks:
    - [ ] E2E stabilization under Playwright
    - [ ] Outside-click cancel and focus handling
  - ACs:
    - [ ] Specs pass in CI
  - Tests (TDD): Playwright specs
  - Steps: event cleanup → overlay focus
  - Estimate: S
  - Status: Not started

## Scope Fence (Out of Scope)

- Advanced editor QoL (formatting, folding, search)
- Non-primitive type extraction
- Multi-file modules and external imports

## Exit Criteria

- All ACs above satisfied; demoable end-to-end with Code Node producing a value consumed by another node.
- Status: In progress
