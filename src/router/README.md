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

**Phase 6 — Routing Architecture Setup — complete.** This folder now holds:

- `routePaths.ts` — typed route constants and `buildWorkout*Path(id)` helpers. Application code imports paths from here and must not inline route strings.
- `routeTypes.ts` — `RouteIdParam` and the `Workout*RouteParams` aliases used with `useParams()`.
- `RequireAuth.tsx` — structural-only auth guard. **Does not implement real authentication.** Real auth lands in Phase 32; until then `RequireAuth` is a pass-through that exposes `AUTH_GUARD_STATUS = 'auth-not-implemented-yet'` so it cannot be mistaken for security.
- `RouteLoadingFallback.tsx` — minimal Suspense fallback for lazy route chunks.
- `routes.tsx` — the route table. Every page is `React.lazy()`-loaded. Auth + modal routes share `AuthLayout`; main routes share `MainLayout` and are wrapped in `<RequireAuth>` for structural symmetry.
- `AppRouter.tsx` — `<BrowserRouter>` shell that renders the route table.
- `layouts/AuthLayout.tsx` and `layouts/MainLayout.tsx` — bare layouts used by the route table. `MainLayout` renders the bottom tab bar.

Programmatic navigation: use the `useNavigation()` wrapper in `src/hooks/useNavigation.ts` — never inline `useNavigate()` with hard-coded URLs.

Pages live in `src/pages/`; this folder owns the routing skeleton only.
