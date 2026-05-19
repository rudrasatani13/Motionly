# 17 — Feedback & Status Component Inventory (Phase 9)

This document is a docs-only reference for the Phase 9 feedback /
status / progress component library that lives under
`src/components/feedback/`. It complements
[`COMPONENTS.md`](../COMPONENTS.md) §8 and the wireframes under
[`docs/wireframes/`](.) — read those first; this page is a quick map
when you arrive cold and need to know which component to reach for.

There is **no runtime demo** for these components: Motionly does not
ship Storybook, a component gallery route, or a sample-data harness.
This file is the inventory.

---

## What this phase delivered

- Eleven feedback / status / progress components, all presentational.
- Two utility modules: `@utils/score` (range clamp + tone mapping) and
  `@utils/formatDuration` (clock-style formatting).
- One new production dependency: `framer-motion` (for animations
  honoring `prefers-reduced-motion`).
- A Motionly-owned in-house toast queue (`ToastProvider` plus
  `useToast` and `ToastViewport`). No third-party toast library.

## What this phase did **not** deliver

- Real product screens.
- Real workout, score, rep, time, confidence, or cue data.
- Camera or microphone access.
- Pose estimation, joint angle math, or exercise engines.
- Authentication, Supabase, payments, analytics, or notifications.
- Push (Web Push) notifications — `ToastProvider` is UI-only.
- Sentry / external error logging — `ErrorBoundary` is local only.

---

## Component / wireframe cross-reference

| Component                    | Used by (future)                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| `CircularProgress`           | `11-post-workout-summary.md`, `13-form-score-details.md`                                  |
| `LinearProgress`             | `08-active-workout.md` (set progress), onboarding step indicator, free-tier quota         |
| `ScoreBadge`                 | `11-post-workout-summary.md` (per-exercise list), `12-progress-history.md` (history rows) |
| `FormCueCard`                | `08-active-workout.md`, `09-mid-workout-feedback.md`                                      |
| `RepCounter`                 | `08-active-workout.md`                                                                    |
| `WorkoutTimer`               | `08-active-workout.md` (top HUD), `10-post-set-summary.md` (rest countdown)               |
| `ToastProvider` / `useToast` | App-wide notifications: workout saved, offline, retry prompts                             |
| `SkeletonLoader`             | Any async surface in `12-progress-history.md`, library, history                           |
| `EmptyState`                 | First-time progress / history / workouts list                                             |
| `ErrorBoundary`              | Layout-level wrapper around lazy route trees                                              |
| `ConfidenceIndicator`        | `09-mid-workout-feedback.md` (low-confidence), camera setup                               |

## Data ownership reminder

The component library is presentational. Each component renders
exactly what the caller passes — no internal score generation, no
internal rep counting, no internal timer loops, no fake cues, no
fake confidence readings, no fake toast messages, no fake empty-state
stats.

When a future phase wires a screen to one of these components, the
data must come from a real source (rep state machine, session store,
form engine, network response). If there is no real source yet, the
component is not rendered. There are no placeholder values that fall
back to invented numbers.

## Accessibility quick reference

- **Progressbar semantics:** `CircularProgress` and `LinearProgress`
  expose `role="progressbar"` with `aria-valuemin=0`,
  `aria-valuemax=100`, and a clamped `aria-valuenow`.
- **Live regions:** `FormCueCard` (`polite` by default, `assertive`
  for active workouts), `RepCounter` (`polite`), `ToastViewport`
  (split into polite and assertive lists), `ConfidenceIndicator`
  (`alert` for `lost`, `status` for everything else).
- **Reduced motion:** every animated component checks
  `useReducedMotion()` from Framer Motion or uses Tailwind
  `motion-reduce:*` so users with reduced-motion settings see a
  static / fade-only experience.

## Score / progress tone helpers

`@utils/score` is the single source of truth for the canonical score
range and the green / amber / red tone mapping:

- `clampScore(value)` → clamp `value` to `[0, 100]`. Non-finite inputs
  return `0`.
- `clampProgress(value)` → alias of `clampScore` for progress contexts.
- `scoreTone(value)` → `'good' | 'warning' | 'danger'` for `>= 80` /
  `50–79` / `< 50`.

Do not inline the thresholds in components; extend the helper.
