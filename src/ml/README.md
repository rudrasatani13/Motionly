# `src/ml/`

On-device machine learning code: pose estimation, joint angles, and per-exercise state machines.

## Subfolders

- `pose/` — MediaPipe wrapper, landmark normalization, smoothing
- `angles/` — joint angle math used by exercise engines and overlays
- `exercises/` — per-exercise state machines (squat, push-up, plank, …) that consume landmarks and emit rep events and form signals

## What belongs here

- Pure functions and classes that take landmarks/angles as input and produce metrics, rep events, or form deltas
- Exercise-specific logic that is testable without a DOM
- Type definitions for landmarks, angles, and exercise events (or thin re-exports from `src/types/`)

## What does NOT belong here

- React components or JSX
- Camera access — that's `src/platform/` (the camera adapter feeds frames into `src/ml/`)
- The actual Web Worker entry points — those live in `src/workers/` and import from here
- Fake ML outputs, simulated scores, or anything that fabricates inference results
- Injury-prediction logic, medical claims, or diagnostic language — Motionly is a movement coach, not a medical device

## Privacy rule

No code in `src/ml/` may transmit raw frames, landmarks, or derived ML data off the device. Cloud sync (when introduced) consumes aggregate metrics only, and that's the job of `src/services/`, never `src/ml/`.

## Phase status

Reserved. ML work begins in **Phase 17 — MediaPipe Pose Landmarker Integration** and continues through the exercise-engine phases. Currently empty by design.
