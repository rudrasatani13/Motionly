# 03 — Home / Dashboard

## Purpose

The first thing a returning user sees on every visit. It must surface "what should I do right now?" in under two seconds — the recommended workout, a quick progress glance, and one clear primary action.

## Route

`/` — already wired in Phase 6 (`@pages/main/DashboardPage`).

## Future implementation phase

**Phase 13 — Home / Dashboard Screen.**

## Entry points

- Splash → dashboard for a returning user with completed onboarding (Phase 10).
- After finishing onboarding flow on first launch (Phase 12).
- After tapping "Done" on a post-workout summary (Phase 28).
- Bottom tab bar — "Home" tab (active by default on Phase 6 `MainLayout`).
- Web-push tap (Phase 44) on a "Time to move" reminder.

## Exit points

- "Start workout" CTA → `/workout/:id/setup` (camera setup, Phase 16).
- "Explore workouts" → `/workouts` (library, Phase 14).
- Tab bar → `/progress` or `/profile`.
- Upgrade banner (free tier only, Phase 38) → `/paywall`.
- Notification settings prompt → `/profile` settings section.

## Primary user action

Tap **Start workout** on today's suggested workout. Everything else on this screen is secondary.

## Secondary actions

- Tap a "Continue exercising" card if the user paused a session earlier.
- Pull to refresh.
- Tap a recent activity card to view its summary (`/workout/:id/summary`).
- Tap "Explore" to reach the workout library.
- Dismiss the upgrade banner (where applicable) for the session.
- Tap the streak chip to navigate to `/progress`.

## Wireframe

```
┌──────────────────────────────────────┐
│  Good evening,                       │  ← greeting line, text-body neutral-500
│  Rudra                               │  ← name from profile; "there" if unknown
├──────────────────────────────────────┤
│  Today's workout                     │  ← section header, text-h3
│  ┌────────────────────────────────┐  │
│  │  Lower Body Foundations         │  │  ← text-h2
│  │  12 min · 5 exercises · easy    │  │  ← meta line, text-body neutral-500
│  │                                 │  │
│  │  ┌──────────────────────────┐   │  │
│  │  │       Start workout       │  │  │  ← primary CTA
│  │  └──────────────────────────┘   │  │
│  └────────────────────────────────┘  │
│                                      │
│  This week                           │  ← section header, text-h3
│  ┌──────────┬──────────┬──────────┐  │
│  │   2/3    │    72    │  4 days  │  │  ← KPIs: sessions, avg form, streak
│  │ sessions │ avg form │  streak  │  │  ← captions
│  └──────────┴──────────┴──────────┘  │
│                                      │
│  Recent activity                     │  ← section header, text-h3
│  ┌────────────────────────────────┐  │
│  │  Push & Pull · yesterday        │  │
│  │  10 min · form 74               │  │
│  ├────────────────────────────────┤  │
│  │  Foundations · 3 days ago       │  │
│  │  12 min · form 68               │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Unlock unlimited workouts →    │  │  ← upgrade banner, free tier only
│  └────────────────────────────────┘  │
│                                      │
├──────────────────────────────────────┤
│  [ Home ]  Workouts  Progress Profile│  ← MainLayout bottom tab bar
└──────────────────────────────────────┘
```

All numbers above ("Lower Body Foundations", "12 min", "72", "4 days") are **illustrative documentation only**. They must not be hard-coded into runtime app code in any phase — they are placeholders to convey _layout and information hierarchy_, nothing more.

## Content rules

- Greeting: time-of-day phrasing ("Good morning / afternoon / evening"). Falls back to "Welcome back" when local time is ambiguous or the user has not set a name.
- Today's workout card: workout name (one line), duration + exercise count + difficulty (one meta line), primary CTA. No description blurb here — that belongs on the detail screen.
- KPIs: at most three. Never display a stat without a label. Never display a stat without a real source.
- Recent activity: maximum three cards. Each card includes workout name, relative date ("yesterday", "3 days ago"), duration, and average form score. Tapping opens that session's summary.
- Upgrade banner: shown only when `subscription === 'free'` and not in the first session. Dismissible per-session.

## Data requirements (future only)

All of the following come from future systems and must not be faked in earlier phases:

| Data point                | Source (future)                                       | Phase   |
| ------------------------- | ----------------------------------------------------- | ------- |
| User name + greeting time | `useUserStore` profile, browser `Date.now()`          | 29 / 13 |
| Today's suggested workout | Beginner plan (Phase 33) → adaptive engine (Phase 34) | 33+     |
| Weekly KPI: sessions      | `getSessionsThisWeek()` from `DatabaseService`        | 30      |
| Weekly KPI: avg form      | `getFormTrend()`                                      | 30      |
| Weekly KPI: streak        | `getCurrentStreak()`                                  | 30      |
| Recent activity           | `getRecentSessions(limit: 3)`                         | 30      |
| Subscription status       | `useSubscriptionStore` + Supabase entitlement         | 36      |

## States to handle later

- **Loading:** skeleton blocks for the four sections (header, today, KPIs, activity). Skeleton must not flash for under 200ms — render the actual block as soon as data arrives.
- **Empty (first session):**
  - "Today's workout" still shows a beginner workout from Phase 33 (this is a programmed plan, not a fake).
  - KPIs show "—" or honest zeros with labels: "0 sessions · No form data yet · Start a streak".
  - Recent activity section is replaced with a one-line illustration: "Your first session shows up here."
- **Error:** if any single section fails to load (e.g. progress query throws), that section renders an inline retry banner; the rest of the screen stays usable.
- **Offline:** all data is local (IndexedDB), so the dashboard works offline. The upgrade banner is hidden offline (its pricing is region-aware and depends on a network call).

## Accessibility notes

- The page heading is the greeting + name; it should be the first focusable / announced element on route entry.
- KPI grid uses a `role="group"` with an `aria-label="This week's summary"` and each KPI exposes both number and label to screen readers.
- "Start workout" CTA must be the largest single tap target on the screen (≥48×48 dp) and stay reachable with a single thumb on a 6.7" device.
- Numbers must never be the only signal — every metric has a label adjacent to it.

## Privacy / safety notes

- No camera or microphone activity on the dashboard.
- Greeting uses only the locally stored display name; do not fetch a name from a third party.
- Recent activity shows local IndexedDB data; nothing is queried server-side until Supabase sync is wired in Phase 31.

## Do not fake

- Do not display fake user names ("Hi, John!") when no profile exists.
- Do not invent "Recommended for you" workouts before the beginner-plan or adaptive engine ships.
- Do not show a streak number unless the streak service has computed it from real session records.
- Do not display fake "Calories burned" or "Active minutes" stats — they are out of scope for the MVP and the privacy posture.
- Do not show motivational nudges ("3 more sessions to unlock a badge!") unless the badge system actually exists and the count is real.
- Do not display a fake "AI tip of the day" — the model has no opinion outside an active session.

## Phase 13 implementation note

The shipped Phase 13 dashboard intentionally differs from the illustrative wireframe because the workout library, workout history, subscriptions, and analytics are still missing.

- No fake user name is rendered in the header; the greeting is time-based only.
- The Today&apos;s Workout card is an honest empty state with a CTA to `/workouts`.
- Quick start is a deferred card that points to `/workouts` instead of launching a fake workout.
- Progress summary cards render unavailable copy instead of invented metrics.
- Recent activity is empty until real workout history exists.
- The upgrade banner stays hidden until a real subscription state exists.
- A small onboarding summary card can appear when the real Phase 12 completion record exists in IndexedDB.
