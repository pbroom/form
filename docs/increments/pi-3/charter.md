# Increment Charter – PI-3

## Context Capsule

- Aim: Elevate the node graph editor to professional application standards with intuitive navigation, organized command access, and foundational math/primitive nodes
- Constraints/Guardrails: Maintain existing functionality and connection-driven semantics; follow established design patterns from tools like Figma; prioritize keyboard-first workflows

## Focus (What we ship)

Professional UX interactions and foundational node organization that transforms the prototype into a tool with production-ready interaction patterns and essential mathematical primitives.

## Prioritized Acceptance Criteria (Cornerstones)

- [ ] WASD navigation pans the node graph viewport smoothly and intuitively
- [ ] Q key opens node palette (insertion-focused), Cmd+K/Cmd+/ opens command palette (all actions)
- [ ] Node palette shows categorized/tagged nodes for efficient browsing and selection
- [ ] Math primitive nodes (Add, Multiply, Vector3, Constants) available and functional
- [ ] Figma-style application menu bar with proper File/Edit/View/Object structure

## Efforts

- Effort: WASD Navigation System

  - Tasks:
    - [ ] Implement WASD keydown handling for node graph editor focus
    - [ ] Add smooth panning animation with configurable speed
    - [ ] Handle focus management between graph and other UI elements
    - [ ] Add visual feedback for active navigation mode
  - ACs:
    - [ ] WASD keys pan the node graph when editor is focused
    - [ ] Navigation respects boundaries and doesn't interfere with text inputs
    - [ ] Smooth animation provides professional feel
  - Tests: Unit tests for key handling; e2e tests for pan behavior
  - Steps: Focus detection → Key handling → Pan integration → Animation polish
  - Estimate: M
  - Status: Not started

- Effort: Professional Command Access

  - Tasks:
    - [ ] Separate node palette (Q) from command palette (Cmd+K/Cmd+/)
    - [ ] Create categorized node organization system
    - [ ] Implement hierarchical command structure
    - [ ] Add search/filtering for large node sets
  - ACs:
    - [ ] Q key shows node insertion palette with categories (Geometry, Math, etc.)
    - [ ] Cmd+K shows full command palette (Export, Project, etc.)
    - [ ] Node categories are browsable and searchable
    - [ ] Commands follow standard application patterns
  - Tests: Keyboard shortcut tests; palette filtering tests; command organization validation
  - Steps: Palette separation → Node categorization → Command organization → Search implementation
  - Estimate: L
  - Status: Not started

- Effort: Math & Primitive Nodes

  - Tasks:
    - [ ] Design math node system architecture
    - [ ] Implement basic arithmetic nodes (Add, Subtract, Multiply, Divide)
    - [ ] Add vector math nodes (Vector3, Dot, Cross, Normalize)
    - [ ] Create constant nodes (Number, Boolean, String, Color)
    - [ ] Integrate math nodes with existing parameter system
  - ACs:
    - [ ] Math nodes process numeric inputs and outputs correctly
    - [ ] Vector operations work with 3D scene parameters
    - [ ] Constants provide reusable values across the graph
    - [ ] Math nodes integrate seamlessly with existing mesh/material parameters
  - Tests: Math operation unit tests; integration tests with scene nodes; parameter flow validation
  - Steps: Architecture design → Basic arithmetic → Vector math → Constants → Integration
  - Estimate: L
  - Status: Not started

- Effort: Figma-Style Menu Bar
  - Tasks:
    - [ ] Design application menu structure (File, Edit, View, Object, Window, Help)
    - [ ] Implement menu bar component with keyboard shortcuts
    - [ ] Organize existing commands into logical menu groups
    - [ ] Add standard application actions (New, Open, Save, Export)
  - ACs:
    - [ ] Menu bar provides access to all application functions
    - [ ] Keyboard shortcuts follow platform conventions
    - [ ] Menu organization matches professional design tool patterns
    - [ ] Hover states and interactions feel polished
  - Tests: Menu navigation tests; keyboard shortcut validation; accessibility compliance
  - Steps: Menu design → Component implementation → Command organization → Polish
  - Estimate: M
  - Status: Not started

## Scope Fence (Out of Scope)

- Advanced math functions (trigonometry, calculus) - save for later increments
- Custom keyboard shortcut configuration - use standard patterns for now
- Multi-selection and bulk operations - focus on single-node workflows
- Advanced animation or interpolation nodes - primitives only
- Undo/redo system - defer to future increment
- File format and project persistence - maintain current project state approach

## Exit Criteria

- All keyboard shortcuts work as expected (Q, WASD, Cmd+K)
- Node palette shows organized categories with math primitives
- Menu bar provides professional application chrome
- WASD navigation feels smooth and intuitive
- Math nodes can be used to create parameterized scenes
- All existing PI-2 functionality preserved and enhanced
