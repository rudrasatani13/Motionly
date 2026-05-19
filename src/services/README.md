# `src/services/`

Business and integration logic that is **not** UI.

## What belongs here

- Supabase client + auth/session helpers (Phase 31+)
- Analytics service (Phase 39, opt-in only)
- Subscription / billing client (Phase 36+)
- IndexedDB persistence helpers (Phase 30) — typically exposed via the storage platform adapter
- Domain-level business logic that is reused across pages

## What does NOT belong here

- Direct browser API calls (camera, TTS, storage primitives, notifications) — those go through `src/platform/`
- React components or JSX
- Global state — that's `src/store/`
- ML inference — that's `src/ml/` and `src/workers/`

## Boundary rule

Services may depend on `src/platform/` and `src/utils/`. They must not depend on `src/components/`, `src/pages/`, or React itself (beyond optional hook adapters).

## Phase status

Reserved. **Phase 4 (this phase) does NOT implement Supabase or any backend integration.** Currently empty by design.
