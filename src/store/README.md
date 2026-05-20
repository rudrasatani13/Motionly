# `src/store/`

Global application state.

## What belongs here

- Zustand stores (introduced in **Phase 29 — State Management**)
- Cross-feature selectors and store-level types
- Store initialization / hydration logic

## What does NOT belong here

- Component-local state (`useState` / `useReducer` stays in the component)
- Network or persistence I/O — that's in `src/services/`
- Derived UI logic that doesn't need to be shared — keep it close to the component

## Phase status

Phase 11 introduces `useOnboardingStore.ts` for the first three onboarding screens. It is intentionally in-memory only: no `localStorage`, IndexedDB, Supabase, auth state, or `hasOnboarded` writes.

Broader cross-feature state management still waits for the planned state-management phase.
