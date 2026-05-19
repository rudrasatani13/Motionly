# `src/hooks/`

Custom React hooks shared across the app.

## What belongs here

- Hooks named `useThing.ts` that wrap shared React state or effects
- Hooks that compose lower-level platform adapters (`src/platform/`) into ergonomic React APIs
- Hooks that bind to stores (`src/store/`) for cross-cutting selectors

## What does NOT belong here

- Hooks that wrap a single component's local state — keep those colocated with the component
- Direct calls to browser-only APIs (camera, TTS, storage, notifications) — go through `src/platform/` first, then expose a hook here if needed
- Network or persistence calls — those belong in `src/services/` and are surfaced via hooks here only as a thin React adapter

## Naming convention

- Files: `useFoo.ts`
- Default export not required; named exports preferred (`export function useFoo()`)
- One hook per file unless tightly related

## Phase status

Phase 5 adds `useTheme.ts` as the public hook re-export for Motionly's theme context. Additional hooks are introduced only when their phase requires them.
