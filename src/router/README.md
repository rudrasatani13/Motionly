# `src/router/`

Routing configuration and navigation primitives.

## What belongs here

- React Router 6 route table (added in Phase 6)
- Route-guard components (`<RequireAuth>` etc.)
- `RouteParams` types and route-name constants
- Programmatic navigation helpers (e.g. a `useNavigation()` wrapper)
- `React.lazy()` route-level code-splitting wiring

## What does NOT belong here

- Page components themselves — those live in `src/pages/`
- Authentication implementation — `src/services/` owns that
- App-wide navigation UI (tab bars, headers) — those are reusable components in `src/components/` that the router _uses_

## Phase status

Reserved. **Phase 4 (this phase) intentionally does NOT implement routing behavior.** The router is introduced in **Phase 6 — Routing Architecture Setup**. Currently empty by design.
