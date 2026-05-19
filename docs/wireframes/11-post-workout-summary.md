# 11 — Post-Workout Summary

## Purpose

The end-of-session screen. Reinforce what the user accomplished, surface what they can improve, and offer a clean exit to either the next session or the home screen. This is the highest-emotion moment in a regular workout — it deserves space, restraint, and honesty.

## Route

`/workout/:id/summary` — wired in Phase 6 (`@pages/workout/WorkoutSummaryPage`).

## Future implementation phase

**Phase 28 — Post-Workout Summary Screen.**

## Entry points

- Final rep of final exercise completes on `/workout/:id/active`.
- User taps "End workout" during a session → confirmation → here (with partial completion flag).
- Tap on a recent activity card on the dashboard.

## Exit points

- "Done" CTA → `/` (dashboard).
- "Share progress" → native share sheet (post-MVP; opt-in; never includes raw video).
- "View details" on a per-exercise card → `13-form-score-details.md` (Phase 35).
- "Repeat workout" → `/workout/:id/setup`.
- "Next workout" → adaptive next-up (Phase 34) → `/workouts/:nextId`.

## Primary user action

Tap **Done**.

## Secondary actions

- Tap a per-exercise card for the detailed score breakdown.
- Share / save (post-MVP).
- Repeat or move on to the next workout.

## Wireframe — completed session

```
┌──────────────────────────────────────┐
│  ✓  Workout complete                 │  ← text-h1, calm celebration
├──────────────────────────────────────┤
│                                      │
│   ┌────────────────────────────┐     │
│   │           ◯◯◯              │     │  ← circular form score ring
│   │            74              │     │     animates 0 → final value
│   │       avg form score        │     │
│   └────────────────────────────┘     │
│                                      │
│  Session                             │
│  ┌────────────────────────────────┐  │
│  │  46 reps · 38 clean             │  │
│  │  12 min · best: glute bridge    │  │
│  └────────────────────────────────┘  │
│                                      │
│  By exercise                         │
│  ┌────────────────────────────────┐  │
│  │  Squat                    72    │  │
│  │  ↳  Keep your chest up.         │  │
│  ├────────────────────────────────┤  │
│  │  Glute bridge             82    │  │
│  │  ↳  All clean.                  │  │
│  ├────────────────────────────────┤  │
│  │  Plank                    68    │  │
│  │  ↳  Hips up.                    │  │
│  └────────────────────────────────┘  │
│                                      │
│  Insight                             │
│  ┌────────────────────────────────┐  │
│  │  Your squat form improved by    │  │
│  │  6 points since last week.      │  │
│  └────────────────────────────────┘  │
│                                      │
│  Streak  ● ● ● ● ◌  4 days           │
│                                      │
│  Next up                             │
│  ┌────────────────────────────────┐  │
│  │  Push & Pull Basics             │  │
│  │  10 min · 4 exercises           │  │
│  └────────────────────────────────┘  │
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │             Done                │  │
│  └────────────────────────────────┘  │
│  Repeat workout · Next up · Share   │  ← secondary actions
└──────────────────────────────────────┘
```

## Wireframe — partial / early end

```
┌──────────────────────────────────────┐
│  Workout saved                       │  ← softer headline; not "complete"
├──────────────────────────────────────┤
│                                      │
│   ┌────────────────────────────┐     │
│   │           ◯◯◯              │     │
│   │            71              │     │
│   │       avg form score        │     │
│   └────────────────────────────┘     │
│                                      │
│  Session                             │
│  ┌────────────────────────────────┐  │
│  │  18 reps · 14 clean             │  │
│  │  4 min · ended at exercise 2    │  │
│  └────────────────────────────────┘  │
│                                      │
│  By exercise                         │
│  ┌────────────────────────────────┐  │
│  │  Squat                    71    │  │
│  │  ↳  Slow down going down.       │  │
│  ├────────────────────────────────┤  │
│  │  Glute bridge          —        │  │  ← unstarted exercises shown
│  │  Not started                    │  │     honestly
│  └────────────────────────────────┘  │
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │             Done                │  │
│  └────────────────────────────────┘  │
│  Resume later · Repeat from start    │
└──────────────────────────────────────┘
```

All sample numbers and names are illustrative documentation only.

## Content rules

- Headline: "Workout complete" for full sessions, "Workout saved" for partial. Same level of warmth, different honesty.
- The form-score ring is the single visual anchor. Animation: 0 → final value in <1 second; no flashy gradient, no decorative confetti beyond a small one-shot effect on first view.
- Session line surfaces totals + one humanizing fact ("best: glute bridge"), never invented superlatives.
- Per-exercise list shows each exercise with its score and a single representative cue (the most frequent cue across the exercise's sets). Unstarted exercises show "—" and "Not started"; never a fake score.
- Insight block: only renders if there is a real comparison ("improved by 6 points since last week"). For first-session users, replace with an honest first-session line ("Welcome — your baseline is set.").
- Streak indicator uses the same dot pattern across the app. Shows the actual day count, never inflated.
- Next up suggestion is the next item from the user's plan (Phase 33/34), not a random pick.
- "Share progress" never shares raw video; if surfaced, it shares a derived image (score + title) — and that surface is post-MVP.

## Data requirements (future only)

| Data point             | Source (future)                              | Phase |
| ---------------------- | -------------------------------------------- | ----- |
| Session totals         | Session store → DB persistence               | 29/30 |
| Per-exercise score     | Aggregated rep scores                        | 21+   |
| Representative cue     | Mode of cues across all sets of the exercise | 21+   |
| Week-over-week insight | `getFormTrend(exerciseId, 14d)`              | 30/34 |
| Streak                 | `getCurrentStreak()`                         | 30    |
| Next up                | Beginner plan / adaptive engine              | 33/34 |

## States to handle later

- **First completed session ever:** insight block becomes "Your first session is logged. Future workouts will compare against this baseline."
- **Zero clean reps:** ring color reflects the actual score (red); copy is supportive but accurate ("Tough session. Setup and lighting can help a lot — try the camera tips next time."). No fake silver-linings.
- **No new improvement over last session:** show neutral copy ("Steady week — no change."). Never invent an uptick.
- **Partial / early end:** dedicated "Workout saved" headline + honest "Not started" rows for unfinished exercises.
- **Loading per-exercise details:** skeleton rows render while aggregations finish.
- **Persist error:** banner "We couldn't save this session to your history. Retry?" — the ring and totals still show, computed in memory.
- **Reduced motion:** ring fills without animation; no confetti.

## Accessibility notes

- Headline lands focus on screen entry.
- The form-score ring is announced verbally ("Average form score: 74 out of 100"). Visual ring is decorative; numeric label is the source of truth for screen readers.
- Per-exercise list rows are focusable buttons that open the detail screen; accessible name combines exercise name, score, and cue.
- Color is never the only signal — the score number adjacent to the ring/bar carries the meaning.
- Screen must remain readable when the device is rotated.

## Privacy / safety notes

- All metrics are derived locally. Sync to Supabase (Phase 31+) carries derived numbers only — never landmarks or video.
- "Share" never includes raw camera output. The derived share image must be reviewed by the user before sharing (default off, opt-in per session).
- Crash analytics (Phase 53) may capture this screen without redaction — it carries no PII or camera content.

## Do not fake

- Do not show a session ring when no session ran.
- Do not show "Streak: 7 days" unless seven consecutive days of real sessions exist.
- Do not surface "You improved by 12 points!" when no historical baseline exists.
- Do not list exercises that were never attempted with a fake score.
- Do not display fake calories burned, fake heart-rate stats, or fake "Active minutes."
- Do not add fake social-proof copy ("You're in the top 20% of users this week.") — we don't have that data and never compute it.
- Do not include manipulative urgency ("Tap Done within 5 seconds to save your streak!").
