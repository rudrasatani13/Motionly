# 05 — Workout Detail

## Purpose

Show the full plan of a workout before the user commits to it. Answers: "What am I about to do, how long will it take, what will it feel like, and what do I need?"

## Route

`/workouts/:id` — wired in Phase 6 (`@pages/workout/WorkoutDetailPage`).

## Future implementation phase

**Phase 15 — Workout Detail & Pre-Workout Screen.**

## Phase 15 implementation note

Phase 15 now implements `/workouts/:id` as a real pre-workout detail screen backed by the canonical static workout catalog in `src/data/workout-library.ts`. The screen includes the abstract hero, meta row, ordered exercise sequence, muscles worked, coach's note, Start Workout action, locked-content handling, and gentle limitation warnings based only on the real Phase 12 onboarding completion record.

Intentional divergences from the early wireframe:

- Limitation warnings do **not** claim Motionly has added a gentler variation yet. Phase 15 only informs the user and suggests moving slowly, reducing range, skipping uncomfortable movements, or choosing another workout.
- Exercise rows are a preview list in Phase 15. A deeper exercise-detail route or modal can land later.
- Start Workout routes to `/workout/:id/setup`, which remains the Phase 16 placeholder. Phase 15 does not request camera permission, open a live camera preview, or start an active workout.

Full camera permission, live setup, silhouette guidance, and any camera/ML checks remain Phase 16 and later.

## Entry points

- Tap on a workout card in the library (Phase 14).
- Tap on a recent activity card in the dashboard "Repeat workout" affordance.
- Direct URL share once shareable links are supported (post-MVP).

## Exit points

- "Start workout" CTA → `/workout/:id/setup` (Phase 16 camera setup placeholder in Phase 15).
- Back navigation → previous screen (library or dashboard).
- Tap an exercise row → exercise detail (modal or push, Phase 14 / 15 decision).
- Limitation conflict banner CTA → swap to an alternative workout (Phase 34+).

## Primary user action

Tap **Start workout**.

## Secondary actions

- Inspect the exercise list.
- Read the coach's note.
- Tap an individual exercise to see the demo / instructions.
- Bookmark / favorite (post-MVP).

## Wireframe

```
┌──────────────────────────────────────┐
│  ←                                   │  ← back nav
├──────────────────────────────────────┤
│                                      │
│         [hero illustration]          │
│                                      │
│  Lower Body Foundations              │  ← text-h1
│  Beginner · 12 min · 5 exercises     │  ← meta line, text-body neutral-500
│  No equipment needed                 │
│                                      │
│  ⚠ This workout includes squats.     │  ← optional limitation warning
│    You flagged knees. We've added    │
│    a gentler variation.              │
│                                      │
│  In this session                     │  ← text-h3
│  ┌────────────────────────────────┐  │
│  │ 1  Bodyweight squat   3×10      │  │
│  │ 2  Glute bridge       3×12      │  │
│  │ 3  Plank              3×30s     │  │
│  │ 4  Reverse lunge      3×8 ea    │  │
│  │ 5  Calf raise         3×15      │  │
│  └────────────────────────────────┘  │
│                                      │
│  What you'll work                    │  ← text-h3
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │Glutes│ │ Quads│ │ Core │ │Calves││  ← muscle chips
│  └──────┘ └──────┘ └──────┘ └──────┘│
│                                      │
│  Coach's note                        │  ← text-h3
│  Take your time on the way down.     │  ← text-body
│  Stop any rep that feels wrong.      │
│                                      │
│  Privacy reminder                    │
│  Video is processed on your device   │  ← caption, neutral-500
│  and never uploaded.                 │
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │       Start workout             │  │  ← primary CTA, sticky bottom
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

All sample names and numbers above are illustrative. Real values come from the seeded library introduced in Phase 30.

## Content rules

- Hero illustration is a calm, abstract image — not a stock photo of an athlete. No body shaming, no body-ideal imagery.
- Meta line lists difficulty, duration, exercise count, and equipment status. "No equipment needed" is shown explicitly because zero-equipment is a product promise.
- Limitation warning appears only when the workout list contains exercises tagged with a region the user flagged in onboarding step 4. Tone is supportive ("We've added a gentler variation"), never alarming.
- Exercise list: numbered, name, sets × reps or duration. No thumbnails required in MVP; if added later, illustrations only.
- Coach's note is one to two sentences. Never marketing copy; always practical.
- Privacy reminder is the third on-device privacy touchpoint and uses the canonical wording.
- "Start workout" is a sticky bottom CTA. It is the most prominent element below the fold.

## Data requirements (future only)

| Data point                | Source (future)                                        | Phase |
| ------------------------- | ------------------------------------------------------ | ----- |
| Workout meta              | `DatabaseService.getWorkout(id)`                       | 30    |
| Exercise sequence         | Same query, expanded                                   | 30    |
| Limitation conflict check | Cross-reference exercises × `useUserStore.limitations` | 30    |
| Modified variation        | Adaptive engine output                                 | 34    |
| Coach's note              | Authored copy bundled with the seeded workout          | 30    |
| Privacy reminder          | Static copy (canonical privacy line)                   | n/a   |

## States to handle later

- **Loading:** skeleton blocks for hero, list, and chips. CTA stays disabled until the workout meta is available.
- **Workout not found:** "We couldn't find that workout." with a "Back to library" CTA. No content cards rendered.
- **Workout removed since last cached:** same not-found path.
- **Network-only enrichments (post-MVP)** — like community completion stats — degrade gracefully when offline. None ship in MVP.
- **Limitation conflict severe:** if the entire workout is incompatible with the user's flagged limitations, the warning becomes a block instead of an inline note, and the CTA copy reads "See alternatives".

## Accessibility notes

- Back arrow has `aria-label="Back"`.
- Sticky CTA must keep ≥48 dp height; do not place it under the safe-area inset.
- Exercise list rows are focusable as buttons; their accessible label includes name, sets × reps, and "Tap to see how it's done."
- Hero illustration has empty `alt=""` if purely decorative; a textual description in the visible meta line covers the content.
- Limitation warning uses an icon + text — never icon alone.

## Privacy / safety notes

- The privacy reminder block is intentional; do not omit it because "the user already saw it." The detail screen is the last screen before the camera permission flow, and the reminder is part of the trust ramp.
- Do not surface third-party share buttons (social) on MVP detail screens — sharing implies upload, even if it doesn't.

## Do not fake

- Do not invent workout names beyond the seeded MVP library. Sample names in this wireframe (e.g. "Lower Body Foundations") are documentation-only examples.
- Do not show "Completed by 1,247 people this week" or any community telemetry — we don't collect it.
- Do not show a fake "Recommended difficulty: 76% match" score.
- Do not display fake "Average heart rate: 132 bpm" — we don't sense heart rate.
- Do not show fake before/after testimonials.
