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

Reserved. The first real components are introduced in **Phase 8 — Core UI Component Library: Primitives**. Currently empty by design.
