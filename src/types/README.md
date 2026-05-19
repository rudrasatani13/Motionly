# `src/types/`

Shared TypeScript type definitions for the app's domain model.

## What belongs here

- Cross-feature domain types (`User`, `Workout`, `Exercise`, `RepEvent`, `FormScore`, …) as they are introduced by their feature phases
- Ambient module declarations (`*.d.ts`) for libraries that lack types
- Branded types and discriminated-union helpers used in more than one module

## What does NOT belong here

- Component prop types — keep those next to the component
- Service-internal types — keep those in the service file unless reused elsewhere
- Fabricated domain types for features that don't exist yet (no speculative API shapes)

## Phase status

Reserved. Types are introduced alongside the features that use them. Empty by design.
