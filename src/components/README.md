# `src/components/`

Shared, reusable **UI** components that can be composed by any page.

## Layout

```
src/components/
├── primitives/   ← Phase 8 reusable UI primitives
├── routing/      ← Phase 6 routing-infrastructure components
├── index.ts      ← top-level barrel (re-exports both)
└── README.md
```

Prefer the subfolder barrels in product code so the import path
documents intent:

- `import { Button, Card, Text } from '@components/primitives';`
- `import { BottomTabBar } from '@components/routing/BottomTabBar';`

## What belongs here

- Phase 8 primitives (`Button`, `Input`, `Text`, `Heading`, `Card`,
  `Divider`, `Spacer`, `Row`, `Column`, `Badge`, `Tag`, `Chip`, `Icon`,
  `Avatar`) under `primitives/`.
- Higher-level shared components used by more than one page.
- Pure presentational components — props in, JSX out.
- Components that may carry minimal local UI state (open/closed, hover,
  focus, password visibility).

## What does NOT belong here

- Route-level screens — those live in `src/pages/`.
- Business logic, API calls, or storage access — that belongs in
  `src/services/`.
- Browser-only API access (camera, TTS, storage, notifications,
  haptics) — that belongs in `src/platform/`. The Phase 8 `Button`
  triggers haptics via `triggerLightHaptic()` from `@platform/haptics`
  instead of calling `navigator.vibrate` directly.
- Global app state — that lives in `src/store/` (Phase 29+).
- Fake/demo UI states or placeholder copy that implies unfinished
  product features are live.
- Phase 9 feedback/status components (`CircularProgress`,
  `LinearProgress`, `ScoreBadge`, `FormCueCard`, `RepCounter`,
  `WorkoutTimer`, `Toast`, `SkeletonLoader`, `EmptyState`,
  `ErrorBoundary`, `ConfidenceIndicator`) — they land in their own
  phase.

## Phase status

**Phase 8 — Core UI Component Library: Primitives** is complete. See
[`../../docs/COMPONENTS.md`](../../docs/COMPONENTS.md) for the
inventory, accessibility rules, light/dark expectations, and the list
of components intentionally deferred to Phase 9.

### `primitives/`

Token-based, typed, accessible primitives. No fake users / workouts /
stats / AI feedback ship through this folder. New primitives follow
the rules in [`COMPONENTS.md` §9](../../docs/COMPONENTS.md#9-adding-a-new-primitive).

### `routing/`

Phase 6 routing-infrastructure components:

- `RoutePlaceholder.tsx` — shared skeleton used by Phase 6 route pages.
- `BottomTabBar.tsx` — NavLink-based mobile bottom navigation.
- `ServiceWorkerStatusPill.tsx` — honest PWA / service-worker status pill.

These remain intentionally separate from `primitives/` until a future
phase decides whether to refactor them onto the primitive library.
