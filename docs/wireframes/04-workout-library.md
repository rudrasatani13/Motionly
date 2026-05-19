# 04 — Workout Library

## Purpose

The browse surface. Users come here to explore options beyond today's suggested workout — by category, by duration, by exercise focus, or by searching directly.

## Route

`/workouts` — wired in Phase 6 (`@pages/workout/WorkoutLibraryPage`).

## Future implementation phase

**Phase 14 — Workout Library Screen.**

## Entry points

- Bottom tab bar → "Workouts" tab.
- Dashboard "Explore workouts" CTA.
- Paywall dismiss → user lands back where they started, often the library.

## Exit points

- Tap a workout card → `/workouts/:id` (workout detail, Phase 15).
- Tap an exercise card (Exercises tab) → exercise detail (sub-state of `/workouts` or future route TBD).
- Tap a locked card → `/paywall`.
- Pull-to-refresh → re-fetches the library, stays on this route.

## Primary user action

Pick a workout to start. Discovery happens via three patterns: featured tiles, filter chips, or search.

## Secondary actions

- Toggle between "Workouts" and "Exercises" tabs.
- Apply / clear filter chips.
- Open search input.
- Tap an exercise to view its instructional detail without starting a workout.

## Wireframe — Workouts tab

```
┌──────────────────────────────────────┐
│  Browse                              │  ← page heading, text-h2
│  ┌────────────────────────────────┐  │
│  │  🔍  Search workouts            │  │  ← collapsible search row
│  └────────────────────────────────┘  │
│                                      │
│  [ Workouts ] | Exercises            │  ← tab switcher
│                                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ │
│  │ All│ │Begi│ │Quik│ │Stren│ │Mobi│ │  ← filter chips
│  └────┘ └────┘ └────┘ └────┘ └────┘ │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Lower Body Foundations         │  │
│  │  12 min · 5 exercises           │  │
│  │  Beginner                       │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  Push & Pull Basics             │  │
│  │  10 min · 4 exercises           │  │
│  │  Beginner                       │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ 🔒 Mobility Reset                │  │  ← locked card on free tier
│  │  8 min · 6 exercises             │  │
│  │  All levels · Pro                │  │
│  └────────────────────────────────┘  │
│                                      │
├──────────────────────────────────────┤
│  Home  [ Workouts ]  Progress Profile│
└──────────────────────────────────────┘
```

## Wireframe — Exercises tab

```
┌──────────────────────────────────────┐
│  Browse                              │
│  ┌────────────────────────────────┐  │
│  │  🔍  Search exercises           │  │
│  └────────────────────────────────┘  │
│                                      │
│  Workouts | [ Exercises ]            │
│                                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ │
│  │ All│ │Legs│ │Push│ │Core│ │Hip │ │  ← muscle / focus chips
│  └────┘ └────┘ └────┘ └────┘ └────┘ │
│                                      │
│  ┌──────────┐  ┌──────────┐          │
│  │  Squat   │  │ Push-up  │          │  ← grid cards (2 columns)
│  │  Beginner│  │ Beginner │          │
│  └──────────┘  └──────────┘          │
│  ┌──────────┐  ┌──────────┐          │
│  │  Plank   │  │  Glute   │          │
│  │  Beginner│  │  Bridge  │          │
│  └──────────┘  └──────────┘          │
│  ┌──────────┐  ┌──────────┐          │
│  │ 🔒 Lunge │  │ 🔒 Bird  │          │  ← locked exercises shown but
│  │  Pro     │  │  Dog Pro │          │     dimmed; tap → paywall
│  └──────────┘  └──────────┘          │
│                                      │
├──────────────────────────────────────┤
│  Home  [ Workouts ]  Progress Profile│
└──────────────────────────────────────┘
```

Sample names ("Lower Body Foundations", "Push & Pull Basics", "Squat", "Plank") are illustrative — they reflect the MVP exercise list in the master plan, but Phase 14 must source them from the seed data introduced in Phase 30, not from a hard-coded literal scattered across components.

## Content rules

- Tab switcher highlights the active tab; the inactive tab is not greyed out (it must look tappable).
- Filter chips are scrollable horizontally on narrow screens. Active chip uses `bg-motionly-primary` text on background; inactive is neutral.
- Each workout card includes: name (text-h3), duration + exercise count meta, level chip, lock icon if locked. No emoji decoration beyond a single lock glyph.
- Locked cards are visible but visually de-emphasized (~60% opacity). Tapping shows the paywall — do not hide the card outright; visibility is part of the upgrade pitch.
- Search is debounced (~250ms). Empty query restores the current chip filter.
- No reviews, ratings, or "popular near you" sections in MVP.

## Data requirements (future only)

| Data point             | Source (future)                              | Phase |
| ---------------------- | -------------------------------------------- | ----- |
| Workout list           | `DatabaseService.getWorkouts()` (seeded)     | 30    |
| Exercise list          | `DatabaseService.getExercises()` (seeded)    | 30    |
| Lock state per item    | `useSubscriptionStore` + per-item `pro` flag | 36/38 |
| Search query results   | Local search over seeded library             | 30    |
| Filter chip categories | Seeded taxonomy                              | 30    |

The library is fully local. No network call is required to browse.

## States to handle later

- **Loading:** skeleton list (3–5 placeholder cards). Filter chips render immediately (they are static).
- **Empty search results:** "No workouts match." with a "Clear search" CTA.
- **Empty filter results:** same pattern, scoped to "No beginner workouts in this filter."
- **Library load error:** inline retry banner; the user can still navigate tabs / chips. Realistically this state is rare because the data is local.
- **Offline:** no degradation — the library is local. Locked items still show locks; tapping shows a paywall card explaining that purchasing requires a connection.

## Accessibility notes

- Tab switcher implemented with `role="tablist"` / `role="tab"` and arrow-key navigation.
- Filter chips are toggleable buttons with `aria-pressed`.
- Each card is a single tappable region announcing "Lower Body Foundations, 12 minutes, 5 exercises, beginner. Locked." when applicable.
- Search input has a visible label or `aria-label="Search workouts"`.
- Color-only signal is not used for locked state — the lock icon is the explicit signal, not just opacity.

## Privacy / safety notes

- No camera or microphone access on this screen.
- Browse activity is not logged remotely until analytics ships (Phase 53), and even then only with opt-in.

## Do not fake

- Do not invent workouts that are not in the seeded MVP library. The 10-exercise MVP set documented in the master plan is the only source.
- Do not display fake "Trending this week" or "Most completed by users like you" sections — those require analytics data we don't collect.
- Do not show fake star ratings or review counts.
- Do not show a "New!" badge unless content versioning actually exists.
- Do not auto-select a workout for the user from the library screen — recommendations belong on the dashboard.
