# 12 — Progress / History

## Purpose

Show the user their improvement over time — the key retention mechanic of the entire product. Progress is what turns "I tried a fitness app" into "I'm sticking with this." It must be honest, calm, and unambiguous about what each chart represents.

## Route

`/progress` — wired in Phase 6 (`@pages/progress/ProgressPage`).

## Future implementation phase

**Phase 34+** introduces the adaptive engine and progress signals. **Phase 35 — Progress & History Screen** builds this view.

## Entry points

- Bottom tab bar → "Progress" tab.
- Dashboard streak chip tap.
- Post-workout summary "View details" path lands here for cross-session comparisons.

## Exit points

- Tap a session card → `/workout/:id/summary` for that historical session.
- Tap a per-exercise card → `13-form-score-details.md` (Phase 35).
- Tab bar → another section.

## Primary user action

Browse trends. The screen is intentionally read-only — the user comes here to look, not to act.

## Secondary actions

- Switch tab: Overview / Exercises / History.
- Pick a time window (7 days / 30 days / All).
- Pick a single exercise to drill into.

## Wireframe — Overview tab

```
┌──────────────────────────────────────┐
│  Your progress                       │  ← page heading, text-h2
│  [ Overview ] | Exercises | History  │  ← tab switcher
├──────────────────────────────────────┤
│                                      │
│  Form score · last 7 days            │  ← chart label
│  ┌────────────────────────────────┐  │
│  │  100                            │  │
│  │   80    ●     ●●                │  │  ← line chart
│  │   60  ●   ●●     ●●             │  │     y-axis labeled
│  │   40                            │  │     x-axis dates
│  │   20                            │  │
│  │    M T W T F S S                │  │
│  └────────────────────────────────┘  │
│                                      │
│  This month                          │
│  ┌───────────┬───────────┬─────────┐ │
│  │  12       │  74       │ 4 days  │ │  ← KPIs
│  │ sessions  │ avg form  │ streak  │ │
│  └───────────┴───────────┴─────────┘ │
│                                      │
│  Streak calendar                     │
│  ┌────────────────────────────────┐  │
│  │  ■ ■ ▢ ■ ■ ■ ■                  │  │  ← week 1
│  │  ■ ■ ■ ▢ ■ ■ ▢                  │  │  ← week 2
│  │  ▢ ■ ■ ■ ▢ ▢ ▢                  │  │  ← week 3
│  └────────────────────────────────┘  │
│                                      │
│  Most improved exercise              │
│  ┌────────────────────────────────┐  │
│  │  Squat   +6 points in 2 weeks   │  │
│  └────────────────────────────────┘  │
│                                      │
├──────────────────────────────────────┤
│  Home  Workouts  [ Progress ] Profile│
└──────────────────────────────────────┘
```

## Wireframe — Exercises tab

```
┌──────────────────────────────────────┐
│  Your progress                       │
│  Overview | [ Exercises ] | History  │
├──────────────────────────────────────┤
│                                      │
│  Exercise  ▾  Squat                  │  ← selector
│                                      │
│  Form score · last 30 days           │
│  ┌────────────────────────────────┐  │
│  │  100                            │  │
│  │   80      ●●  ●                 │  │
│  │   60  ● ●    ●  ●●●             │  │
│  │   40                            │  │
│  └────────────────────────────────┘  │
│                                      │
│  Most common cue                     │
│  ┌────────────────────────────────┐  │
│  │  Keep your chest up.            │  │
│  └────────────────────────────────┘  │
│                                      │
│  Last 5 sessions                     │
│  ┌────────────────────────────────┐  │
│  │  Sat · 76 · 30 reps             │  │
│  │  Thu · 72 · 28 reps             │  │
│  │  Tue · 70 · 26 reps             │  │
│  │  Sat · 68 · 26 reps             │  │
│  │  Wed · 66 · 24 reps             │  │
│  └────────────────────────────────┘  │
│                                      │
├──────────────────────────────────────┤
│  Home  Workouts  [ Progress ] Profile│
└──────────────────────────────────────┘
```

## Wireframe — History tab

```
┌──────────────────────────────────────┐
│  Your progress                       │
│  Overview | Exercises | [ History ]  │
├──────────────────────────────────────┤
│                                      │
│  This week                           │  ← grouped by week
│  ┌────────────────────────────────┐  │
│  │  Today                          │  │
│  │  Foundations · 12 min · 74      │  │
│  ├────────────────────────────────┤  │
│  │  Yesterday                      │  │
│  │  Push & Pull · 10 min · 72      │  │
│  └────────────────────────────────┘  │
│                                      │
│  Last week                           │
│  ┌────────────────────────────────┐  │
│  │  Sat · Foundations · 12m · 70   │  │
│  │  Wed · Push & Pull · 10m · 68   │  │
│  │  Mon · Mobility · 8m · 66       │  │
│  └────────────────────────────────┘  │
│                                      │
├──────────────────────────────────────┤
│  Home  Workouts  [ Progress ] Profile│
└──────────────────────────────────────┘
```

All sample data is illustrative documentation only.

## Content rules

- Each chart **must** be labeled with what it represents. Never an unlabeled chart.
- Use the same color scale across cards (green for high scores, neutral for mid, red for low) consistent with the rest of the app.
- Time windows: 7 days, 30 days, All. Default to 7 days.
- Per-exercise pages show: trend, most common cue (mode), last N sessions.
- "Most improved exercise" surfaces only if there is real improvement; otherwise omit the section. Never invent improvement.
- The streak calendar shows the same week structure regardless of locale — Mon→Sun. Localization comes later.

## Data requirements (future only)

| Data point             | Source (future)                      | Phase |
| ---------------------- | ------------------------------------ | ----- |
| Per-session score      | `sessions` table                     | 30    |
| Per-exercise trend     | `getFormTrend(exerciseId, days)`     | 30    |
| Most common cue        | `getTopCue(exerciseId, days)`        | 30    |
| Streak                 | `getCurrentStreak()`                 | 30    |
| Most improved exercise | Cross-exercise delta over the window | 34    |
| Free tier 7-day limit  | `useSubscriptionStore` enforcement   | 38    |

## States to handle later

- **No sessions yet (first-time user):** all tabs show an empty state with the same message: "Your progress shows up here after your first workout." Single CTA: "Start a workout" → `/workouts`. No fake charts.
- **One session only:** show a single dot on each chart and explicit copy: "We need a few more sessions to draw a trend."
- **Sparse data:** charts render with gaps; gaps are visible, not interpolated.
- **Loading:** chart skeleton (axes outlined, no points) plus KPI skeletons.
- **Free tier with 7-day-only history (Phase 38):** show 7-day data + a single upgrade block explaining that older history is available on Pro. Do not blank-out older data ranges visually as if the user has none.
- **Offline:** all data is local — works fully offline.
- **Reduced motion:** chart points appear without animation; no "racing dot" intros.

## Accessibility notes

- Each chart has a textual summary adjacent ("Form score range over the last 7 days: 62–80"). Screen readers should not need to interpret the line.
- Tab switcher uses `role="tablist"`.
- Color is never the sole signal — values are listed alongside.
- Streak calendar exposes the days as a `role="list"` with each cell's date and status announced.
- All charts must remain readable when the device is rotated.

## Privacy / safety notes

- All data is local; no network call required to display progress.
- Future sync (Phase 31+) carries derived numbers; this screen never displays anything the user couldn't see locally.
- "Share progress" affordance (post-MVP) creates a derived image; the user must confirm before any share. Default off.

## Do not fake

- Do not draw a smooth trendline if there are only one or two data points.
- Do not show invented streaks, sessions, or KPIs.
- Do not show fake "Leaderboard" or "Friends" panels — Motionly is not a social product in MVP.
- Do not show fake "Goals" badges that the user didn't set.
- Do not show fake "Calories burned" totals.
- Do not display a fake projected improvement ("On track to hit 85 in 3 weeks").
