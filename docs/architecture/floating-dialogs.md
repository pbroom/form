<!-- markdownlint-disable MD013 -->

## Floating Dialogs (Draggable, Stackable, Dismissable)

Purpose: Define the UX, component contracts, and state model for floating dialogs used for transient, tool-like interfaces (e.g., color pickers, stroke/border controls, variable choosers). These dialogs complement the Properties Panel by hosting short‑lived, often nested flows without permanently occupying panel real estate.

### Goals

- Provide a consistent, accessible, draggable dialog surface with header (title + close) and body content.
- Support multiple dialogs concurrently with deterministic stacking (z-index), focus, and keyboard controls.
- Allow optional click‑away/escape dismissal per dialog; parent/child dialog lifecycles are coordinated.
- Constrain dragging within the viewport; optionally remember last position per dialog id.
- Keep implementation lightweight (Tailwind + shadcn primitives + small store), with no dependency on external window managers.

### Non-Goals (Phase 1)

- Resizable corners/edges; snapping/magnetism; multi-monitor persistence; docking/tearing; cross‑window.

### Anatomy

- Header: drag handle area, title, optional subtitle/breadcrumbs, close button.
- Body: arbitrary React content (forms, lists, pickers, previews).
- Chrome: shadow, rounded corners, themable surface; portal to a `DialogLayer` container.

### Accessibility & Keyboard

- Focus trap within active dialog by default; configurable to allow background interaction for tooltips/hover previews.
- `Esc` closes when `dismissOnEscape=true`.
- Click‑away closes when `dismissOnClickAway=true` and no child dialog is open.
- Tab order begins at header close → first focusable in body.
- ARIA: role="dialog"; `aria-modal` toggled based on `modal` prop; label from `title`.

### State Model

Use a dedicated external store (Zustand) to manage a stack of dialogs and z‑order without re‑rendering the entire app.

```ts
type DialogId = string;

type FloatingDialogSpec = {
	id: DialogId;
	title: string;
	content: ReactNode;
	initialPosition?: {x: number; y: number};
	size?: {width?: number; height?: number};
	modal?: boolean; // traps focus & blocks background
	dismissOnClickAway?: boolean;
	dismissOnEscape?: boolean;
	parentId?: DialogId; // for nested lifecycles
};

type FloatingDialogInstance = FloatingDialogSpec & {
	z: number;
	position: {x: number; y: number};
	isActive: boolean;
};

type FloatingDialogStore = {
	dialogs: Record<DialogId, FloatingDialogInstance>;
	stack: DialogId[]; // topmost at end
	open(spec: FloatingDialogSpec): void;
	close(id: DialogId): void;
	closeGroup(rootId: DialogId): void; // closes id and its descendants
	bringToFront(id: DialogId): void;
	setPosition(id: DialogId, pos: {x: number; y: number}): void;
	isOpen(id: DialogId): boolean;
};
```

Z‑order policy: `bringToFront` moves id to stack end and updates `z` as `baseZ + index`. Active dialog receives focus.

Parent/child behavior: Opening a dialog with `parentId` keeps the parent open; closing a parent closes all descendants via `closeGroup(parentId)`.

### Component Contracts

- `FloatingDialog` (presentational):
  - Props: `{ id, title, position, onDrag, onClose, modal, dismissOnClickAway, dismissOnEscape, children }`.
  - Emits `onDrag` with deltas; caller clamps to viewport and persists.
  - Renders in a portal within `#dialog-layer` (or body fallback) to ensure it sits above node editor surfaces.

- `FloatingDialogsHost` (manager):
  - Subscribes to store; renders all dialogs; handles z‑index and focus/aria attributes.
  - Attaches global key handler for `Esc` when topmost dialog is dismissable.

- API helpers:
  - `openDialog(spec: FloatingDialogSpec)` → `DialogId`
  - `closeDialog(id: DialogId)`
  - `withChildDialog(parentId, spec)` convenience wrapper

### Dragging Implementation

- Use Pointer Events with a simple `useDrag` hook or `@dnd-kit` if it is already in the bundle (present). The hook updates store position with `requestAnimationFrame` throttling.
- Constrain to viewport bounds from `window.innerWidth/Height` minus dialog size; recompute on resize.

### Persistence

- Ephemeral by default. Optionally persist `position` keyed by `DialogId` in session storage for QoL. Not part of Phase 1 acceptance.

### Theming

- Tailwind tokens with dark/light support; minimum width 280px; elevation scale integrates with existing panel elevations.

### Error & Edge Cases

- If content taller than viewport, body becomes scrollable; header remains fixed.
- If parent closes, children auto-close; if child opens, `dismissOnClickAway` for parent is temporarily disabled until child closes.

### Test Plan (when implemented)

- Unit: store operations (open/close/stack/bringToFront/closeGroup/setPosition).
- E2E: open dialog, drag within bounds, z‑order focus on click, Esc/Click‑away dismissal, parent→child lifecycle.
- A11y: role, label, focus trap, keyboard navigation.

### Example Usage

```tsx
const onPickColor = () => {
	openDialog({
		id: 'color-picker',
		title: 'Color',
		content: <ColorPicker value={color} onChange={setColor} />,
		initialPosition: {x: 420, y: 160},
		dismissOnClickAway: true,
		dismissOnEscape: true,
	});
};
```

This RFC covers the architectural contract; implementation may be scheduled within Phase 1 if needed by Properties Panel controls, otherwise targeted early in Phase 2.
