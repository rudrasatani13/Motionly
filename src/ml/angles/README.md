# `src/ml/angles/`

Joint angle calculations used by exercise engines and skeleton overlays.

## What belongs here

- Pure math functions: `angleBetween(a, b, c)`, `kneeAngle(landmarks)`, `hipAngle(landmarks)`, …
- Constants for angle thresholds (kept generic; per-exercise thresholds live with the exercise engine)
- Helpers for symmetry checks (left-vs-right deltas)

## What does NOT belong here

- Stateful logic — angles are computed per frame and don't own state
- Exercise rep counting or form scoring — that's `src/ml/exercises/`
- Drawing — that's the overlay component

## Phase status

Reserved. Introduced in **Phase 20 — Joint Angle Calculations**. Empty by design.
