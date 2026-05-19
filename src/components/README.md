# `src/components/`

Shared, reusable **UI** components that can be composed by any page.

## What belongs here

- Visual primitives (`Button`, `Input`, `Card`, `Badge`, `Row`, `Column`, …) introduced in Phase 8
- Higher-level shared components used by more than one page
- Pure presentational components — props in, JSX out
- Components that may carry minimal local UI state (open/closed, hover, focus)

## What does NOT belong here

- Route-level screens — those live in `src/pages/`
- Business logic, API calls, or storage access — that belongs in `src/services/`
- Browser-only API access (camera, TTS, storage, notifications) — that belongs in `src/platform/`
- Global app state — that lives in `src/store/` (Phase 29+)
- Fake/demo UI states or placeholder copy that implies unfinished product features are live

## Phase status

The first real components are introduced in **Phase 8 — Core UI Component Library: Primitives**.

**Narrow Phase 6 exception:** routing infrastructure components live in `src/components/routing/`:

- `RoutePlaceholder.tsx` — shared skeleton component used by every Phase 6 route page.
- `BottomTabBar.tsx` — mobile bottom navigation (NavLink-based) used by `MainLayout`.
- `ServiceWorkerStatusPill.tsx` — honest PWA / service-worker status pill.

These exist because Phase 6 needs route-skeleton UI. They are intentionally minimal and will be revisited (or replaced) once the Phase 8 primitive library lands. **Do not** anticipate that work by inventing `Button`, `Card`, `Input`, `Badge`, or other primitives in this folder before Phase 8.
