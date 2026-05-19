# `src/pages/`

Route-level screens. Each file maps to a URL configured in `src/router/`.

## What belongs here

- One component per top-level screen (Dashboard, Workout Library, Workout Detail, Active Workout, Summary, Progress, Profile, …)
- Page-specific layout composition that pulls shared primitives from `src/components/`
- Data-loading orchestration that calls into `src/services/` and stores via `src/store/`

## What does NOT belong here

- Routing logic itself — that belongs in `src/router/` (Phase 6)
- Reusable UI primitives — those belong in `src/components/`
- API or persistence implementations — those belong in `src/services/`
- Direct camera / TTS / storage / notification calls — those go through `src/platform/`
- Fake user data, placeholder workouts, or claims about features that don't exist yet

## Phase status

Reserved. Pages are introduced from **Phase 10 — Splash / Launch Screen** onward. Currently empty by design.
