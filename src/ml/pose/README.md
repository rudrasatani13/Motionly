# `src/ml/pose/`

MediaPipe Pose Landmarker integration and landmark post-processing.

## What belongs here

- MediaPipe Pose Landmarker wrapper (loading, configuration, inference)
- Landmark normalization (coordinate space, mirroring, confidence gating)
- Smoothing / Kalman / One-Euro filters applied to landmark streams
- Pose-quality heuristics (frame skipped, low confidence, off-frame)

## What does NOT belong here

- Camera access — that's the camera adapter in `src/platform/`
- Drawing the skeleton overlay — that's a UI component
- Exercise-specific rep counting or form rules — those go in `src/ml/exercises/`
- The Web Worker shell — that's `src/workers/` (and it imports from here)

## Phase status

Reserved for **Phase 17 — MediaPipe Pose Landmarker Integration** and **Phase 18 — Landmark Smoothing**. Empty by design.
