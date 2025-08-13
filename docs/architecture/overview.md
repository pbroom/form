# Architecture Overview

This document provides a high-level view of the system.

- UI: React + Vite + Tailwind
- Graph Editing: @xyflow/react custom nodes
- 3D View: three.js via @react-three/fiber

Compiler-shaped flow

- Node Graph UI ⇄ IR (graph + tree + meta) ⇄ Code Generators
- Library Adapters introspect external packages to populate node registry

Future sections:

- Runtime data flow
- Node/edge model
- Rendering pipeline
