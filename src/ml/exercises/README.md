# `src/ml/exercises/`

Per-exercise state machines. Each module owns rep counting (Phase 20+)
and, in later phases, form rules and coaching cues. Pure TypeScript
math + small in-memory accumulators; no React, no DOM, no MediaPipe
imports, no network, no persistence.

## What belongs here

- **Phase 20 — Squat rep state machine.**
  - `SquatEngine.ts` — `STANDING → DESCENDING → BOTTOM → ASCENDING →
STANDING` state machine over Phase 19 `AngleSnapshot`s. Counts only
    full reps; rejects half-reps with a typed reason. Tracks raw rep
    metrics (bottom knee angle, min knee angles, average trunk angle,
    max knee valgus ratios, duration, bottom dwell frames) for later
    Phase 21 form scoring to build on. **No form score, no cues, no
    voice / haptic side effects, no persistence.**
  - `squat-config.ts` — squat threshold constants (standing 160°,
    beginner bottom 110°, intermediate bottom 90°, 15-frame minimum
    bottom dwell, rep-duration bounds). Centralized so per-user /
    adaptive tuning later phases can extend without touching the
    engine.
  - `squat-utils.ts` — pure helpers for reading angle / metric values
    safely (`isAngleAvailable`, `isMetricAvailable`,
    `getAverageKneeAngle`, `kneesAboveStanding`, `kneesBelowBottom`,
    `averageNonNull`, `safeMin` / `safeMax`, …). No side effects.
  - `index.ts` — barrel.

## State machine behaviour (Phase 20)

```
                ┌───────────┐
   start ───►   │ STANDING  │ ◄────────────────────────┐
                └─────┬─────┘                          │
                      │ both knees flex below 160°     │
                      ▼                                │
                ┌───────────┐                          │
                │DESCENDING │                          │
                └─────┬─────┘                          │
                      │ both knees < depth threshold   │
                      ▼                                │
                ┌───────────┐                          │
                │  BOTTOM   │  (≥ 15-frame dwell)      │
                └─────┬─────┘                          │
                      │ knees begin extending          │
                      ▼                                │
                ┌───────────┐                          │
                │ASCENDING  │                          │
                └─────┬─────┘                          │
                      │ both knees ≥ 160° again        │
                      └────────────────────────────────┘
```

Reps count only when **all** of these hold:

- The user reached STANDING at least once before the rep began.
- BOTTOM was reached (both knees below the difficulty's threshold).
- BOTTOM dwell ≥ 15 frames (≈ 0.5 s at ~30 FPS).
- The user returned to STANDING.
- Required knee angles stayed available for the duration.
- Rep duration fell inside `[minRepDurationMs, maxRepDurationMs]`.

Half-reps that bounce out of DESCENDING without touching BOTTOM are
emitted as rejected with `rejection_reason: 'half_rep_depth_not_reached'`.
Rejections do **not** increment the rep count.

## Difficulty

`beginner` uses a bottom-depth threshold of 110°; `intermediate` uses
90°. Switching difficulty mid-session cancels any in-flight rep so
threshold changes can't half-count an attempt framed under the
previous setting.

## What does NOT belong here

- Pose / landmark detection — `src/ml/pose/`.
- Angle math — `src/ml/angles/`.
- UI surfaces — `src/components/pose-debug/` (debug only in Phase 20).
- Voice playback — `src/platform/speech.ts` (Phase 25 voice cues are
  out of scope).
- Form scoring, coaching cues, "good vs bad" labels — Phase 21+.
- Workout sessions, timers, summaries, history, calories, streaks —
  Phase 27+.
- Persistence of any kind. Engines reset on stop / unmount / no-pose /
  workout change / explicit `reset()`.

## Intentionally deferred (Phase 21+)

- `SquatFormRules.ts` — depth adequacy, knee valgus, trunk lean,
  heel rise, asymmetry, tempo.
- `FormScorer.ts` — start-at-100, deduct-per-violation scoring.
- `CueThrottler.ts` — block repeating the same cue for N reps.
- Per-exercise visibility floors and confidence gating.
- Voice coaching cues (Phase 25).
- Other exercise engines (push-up, plank, glute bridge, etc.) —
  Phase 22+.

The raw metrics on `SquatRepResult` (`bottomKneeAngleDegrees`,
`averageTrunkAngleDegrees`, `maxLeftKneeValgusRatio`,
`maxRightKneeValgusRatio`, `durationMs`, …) are deliberately
collected during Phase 20 so the Phase 21 form-rule layer has real
data to consume. Phase 20 **does not judge** them.

## How to manually validate Phase 20

Open `/workout/:id/active` for a workout that contains the
bodyweight squat (e.g. **Lower Body Foundations**), tap **Start pose
debug**, and watch the **Squat rep debug** panel:

- Stand upright first and confirm the engine initializes as
  `STANDING` and the rep count is `0`.
- Do 10 full squats at a steady pace and confirm the rep count
  reaches `10`.
- Do half squats that don't reach the bottom-depth threshold and
  confirm they show up as rejected (`half_rep_depth_not_reached`) and
  do not increment the rep count.
- Try slow (~4 s/rep), medium (~2 s/rep), and fast (~1 s/rep) reps;
  all should count provided the bottom dwell still clears the
  15-frame threshold.
- Start from a crouched / bottom position and confirm no rep counts
  until the user first reaches STANDING.
- Step out of frame mid-rep and confirm the in-flight rep is
  discarded (`visibility_lost`) — no fake count, no stale BOTTOM
  state.
- Cover one knee and confirm the engine refuses to fabricate knee
  angles — the in-flight rep is discarded and the panel surfaces a
  technical reason.
- Tap **Reset squat detector** and confirm rep count / state clear.
- Tap **Stop pose debug** and confirm the engine resets cleanly with
  the rest of the pose pipeline.

See `docs/SETUP.md` for the full Phase 20 manual QA checklist.
