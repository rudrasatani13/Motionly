# `src/utils/`

Small, pure helper functions and shared constants with no React or DOM dependencies.

## What belongs here

- Math helpers (clamp, lerp, smoothing primitives that aren't pose-specific)
- Formatters (time, duration, number)
- Generic predicates and type guards
- App-wide constants that don't fit a more specific folder
- Class composition helpers — `cn.ts` (Phase 8) wraps `clsx` for the
  primitive components

## What does NOT belong here

- React components or hooks — hooks go to `src/hooks/`
- Browser-API access — that's `src/platform/`
- Business logic — that's `src/services/`
- Pose / angle math — that's `src/ml/`
- Anything that imports from `src/components/`, `src/pages/`, or `src/store/` (utilities are leaf modules)

## Phase status

**Phase 8** added `cn.ts`, the `clsx` wrapper used by every primitive
in `src/components/primitives/`. Other utilities accrue as features are
built.
