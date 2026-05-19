# `src/ml/exercises/`

Per-exercise state machines. Each file owns the rep-counting and form-cue logic for one movement.

## What belongs here

- One module per exercise (e.g. `squat.ts`, `pushup.ts`, `plank.ts`)
- A clear state machine: `READY → DESCENT → BOTTOM → ASCENT → REP_COMPLETE` (and similar)
- Form cues derived from joint angles (depth, alignment, tempo)
- Pure functions where possible — `(landmarks, prevState) => nextState | event`

## What does NOT belong here

- Pose detection itself — that's `src/ml/pose/`
- Angle math — that's `src/ml/angles/`
- UI feedback rendering — that's a page/component listening to events
- TTS playback — that's the voice adapter in `src/platform/`
- Fake rep counts or fabricated form scores
- Medical or injury-risk claims

## Phase status

Reserved. Exercise engines are introduced from **Phase 22 — First Exercise Engine** onward. Empty by design.
