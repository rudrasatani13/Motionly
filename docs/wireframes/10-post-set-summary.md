# 10 — Post-Set Summary

## Purpose

A brief check-in between sets that confirms what just happened and what's coming next. Not the celebratory end-of-workout — that lives in `11-post-workout-summary.md`. This is the quiet moment that helps the user catch their breath and re-engage.

## Route

Sub-state of `/workout/:id/active`. May be rendered as a full-screen overlay rather than a route, depending on Phase 27 decisions. No separate URL.

## Future implementation phase

**Phase 27 — Active Workout Screen (Full Assembly)** introduces between-set rest screens. **Phase 28** can refine the post-set summary with deeper per-set analytics.

## Entry points

- The last rep of the current set has been counted (rep counter equals set target).
- User manually skipped to the end of the current set (rare).

## Exit points

- Rest countdown completes → next set begins on `08-active-workout.md`.
- "Skip rest" CTA → next set begins immediately.
- "End workout" → confirm dialog → `/workout/:id/summary`.

## Primary user action

Rest, then continue. The set summary is a passive screen that auto-advances.

## Secondary actions

- Skip rest.
- End workout.
- Mute / unmute voice.

## Wireframe

```
┌──────────────────────────────────────┐
│ ⏸  Resting · 0:27        🔊       ✕ │
├──────────────────────────────────────┤
│                                      │
│         Set 1 of 3 complete          │  ← text-h2
│                                      │
│   ┌────────────────────────────┐     │
│   │  10 reps · 8 clean          │     │  ← per-set metrics
│   │  Avg form   ●●●○○  72       │     │  ← score bar; numbers come from
│   └────────────────────────────┘     │     real per-rep scoring (Phase 21+)
│                                      │
│   Top cue this set                   │  ← optional, max one cue surfaced
│   ┌────────────────────────────┐     │
│   │  Keep your chest up.       │     │
│   └────────────────────────────┘     │
│                                      │
│           Up next                    │
│           Set 2 of 3                 │
│                                      │
│             00 : 27                  │  ← rest countdown
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │           Skip rest             │  │
│  └────────────────────────────────┘  │
│                                      │
│  End workout                         │  ← text link, secondary
└──────────────────────────────────────┘
```

All sample numbers are illustrative documentation only.

## Content rules

- The headline confirms which set just finished, not which set is coming. Reflection beats prediction here.
- Per-set metrics show **at most three**: total reps, clean reps (score ≥ threshold), average form score. No additional stats stacked.
- Score bar uses the canonical color scale from `09-mid-workout-feedback.md` (green ≥80, amber 50–79, red <50) — applied to a dot-style bar, not a single colored ring (the ring is reserved for the workout summary screen).
- Surface at most **one** "top cue this set." If the user got zero cues, omit the section entirely; do not fabricate one.
- Up next preview is minimal — set number, name optional (the exercise is the same; it changes only between exercises, not between sets).
- Rest timer is large and centered but does not jitter.

## Data requirements (future only)

| Data point       | Source (future)                           | Phase |
| ---------------- | ----------------------------------------- | ----- |
| Reps in set      | Rep state machine                         | 20+   |
| Clean reps       | Per-rep form score ≥ threshold            | 21+   |
| Avg form score   | Mean of per-rep scores within the set     | 21+   |
| Top cue this set | Highest-frequency or highest-priority cue | 21+   |
| Rest duration    | Workout configuration                     | 30    |

## States to handle later

- **First set ever:** no historical baseline; show "Your first set is in the books." with the same metrics block.
- **Zero clean reps:** show metrics honestly; the top cue section becomes the dominant prompt. No shaming copy.
- **No cues this set:** omit the cue block; congratulate sparingly ("All clean.") and not on every set.
- **User taps "Skip rest" early:** transition to next set immediately, no animation flourish.
- **Auto-advance after rest timer:** countdown reaches zero → next set begins.
- **Pose lost during rest:** ignored — rest does not depend on pose.
- **Reduced motion:** rest countdown number changes without animation effects.

## Accessibility notes

- Headline lands focus on screen entry so screen readers announce the set completion.
- Per-set metrics are exposed as a `role="group"` with descriptive labels — "10 reps, 8 clean, average form score 72 out of 100."
- The rest countdown announces every 10 seconds (`aria-live="polite"`) and at the final 3 seconds counts down ("3, 2, 1").
- Skip rest is a button, not a link.
- Color of the score bar must not be the only carrier of meaning — adjacent numerical score plus the dot pattern carry the same information.

## Privacy / safety notes

- All metrics come from on-device computations; no network calls happen between sets.
- Voice cue ("Set 1 complete. 27 seconds of rest.") uses on-device TTS only.
- Per-set landmark data is discarded after the score is computed; only the derived numbers persist.

## Do not fake

- Do not display invented per-set scores ("89!") before the form engine has scored anything. In Phases 6 and 7, this screen does not run.
- Do not invent a "personal best" ribbon before a real local history exists.
- Do not show fake calorie or heart-rate values per set.
- Do not display a cue that did not fire during the set.
- Do not auto-praise after every set; reserve praise for streaks of clean sets (and only the workout summary speaks loudly).
