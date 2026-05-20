# `src/ml/pose/`

MediaPipe Pose Landmarker integration and the Phase 18 landmark
processing layer.

## What belongs here

- **Phase 17 — MediaPipe boundary.**
  - `PoseLandmarker.ts` — the single file that imports
    `@mediapipe/tasks-vision`. Owns `FilesetResolver`,
    `createFromOptions`, `detectForVideo`, GPU → CPU delegate fallback,
    and `close()`. Converts vendor `NormalizedLandmark` shapes into
    Motionly's `PoseDetectionResult` so vendor symbols never leak.
  - `pose-model-config.ts` — model URLs, default variant, delegate
    preference, MediaPipe confidence thresholds, WASM base path,
    minimum frame interval.
  - `landmark-names.ts` — 33-point MediaPipe Pose Landmarker name →
    index map, `POSE_LANDMARK_COUNT`, key body indices used by Phase
    17 debug rendering.
- **Phase 18 — Landmark processing layer.**
  - `pose-processing-config.ts` — defaults for smoothing α (`0.5`),
    per-landmark visibility threshold (`0.6`), body-visibility
    threshold (`0.6`), minimum torso scale (`1e-3`), plus key body
    landmark index list and safe clamp helpers.
  - `LandmarkSmoother.ts` — per-axis Exponential Moving Average
    (`smoothed = α * raw + (1 − α) * previous`). Resets on no-pose /
    partial-pose / model restart. Never invents landmarks.
  - `ConfidenceFilter.ts` — tags each landmark visible-or-not using
    real MediaPipe visibility (plus presence when meaningful),
    computes the mean key-landmark visibility score, and builds the
    per-frame `PoseVisibilityReport` with named occlusion lists.
  - `LandmarkNormalizer.ts` — centers smoothed landmarks on the hip
    midpoint and divides by the hip-to-shoulder torso scale. Returns a
    tagged failure reason when the torso reference is missing,
    occluded below threshold, too small, or numerically unstable.
  - `processPoseFrame.ts` — `PoseFrameProcessor` class that owns the
    smoother instance and runs the per-frame pipeline:
    filter → smooth → tag → normalize, with stage timings. Plus the
    functional `processPoseFrame(processor, frame)` wrapper.

## What does NOT belong here

- Camera access — the platform adapter in `src/platform/camera-stream.ts`.
- Drawing the skeleton overlay — UI lives in `src/components/pose-debug/`.
- Joint angle math — Phase 19, lives in `src/ml/angles/`.
- Exercise-specific rep counting or form rules — Phase 20+, lives in `src/ml/exercises/`.
- The Web Worker shell — Phase 19+ task, lives in `src/workers/` and would import from here.

## Phase 18 processing flow

For each raw `PoseFrame` the processor runs:

1. **Confidence filter** on the raw landmarks to build a
   `PoseVisibilityReport` (per-key-landmark detail + occlusion lists +
   mean score).
2. **Smoothing** with the EMA smoother. Returns `null` on partial /
   no-pose, which also resets the smoother — stale EMA state must
   never bleed into a later detection.
3. **Confidence filter (smoothed)** so each smoothed landmark carries
   the same `isVisible` tag the report and the normalizer rely on.
4. **Normalization** to torso-scale coordinates. On failure (no
   landmarks, key landmarks occluded, invalid torso scale, numeric
   instability) the normalizer returns `normalized: false` with the
   reason; smoothed landmarks remain usable.
5. **Pack** into a `ProcessedPoseFrame` with stage timings
   (`smoothingMs`, `filteringMs`, `normalizationMs`,
   `totalProcessingMs`) and processed/dropped frame counts.

The hook in `src/hooks/usePoseLandmarker.ts` owns the processor and
calls `process()` per raw frame; the pose store keeps both the raw
`PoseFrame` and the resulting `ProcessedPoseFrame`. No history is
stored.

## Intentionally deferred

- Joint angles (Phase 19).
- Exercise state machines, rep counting (Phase 20+).
- Form scoring and coaching cues (Phase 21+).
- Voice feedback (Phase 25).
- Final camera-space skeleton overlay (Phase 26).
- Workout history / session records / Supabase / auth / payments /
  analytics.
- Persistence of any kind for landmarks, video frames, world
  landmarks, or processing stats. The pose pipeline is strictly
  in-memory; the latest raw + processed frames live in the Zustand
  store and reset on stop / unmount.

## How to manually validate Phase 18

Run `pnpm preview`, navigate through onboarding → workout library →
free workout → camera setup → active, then **Start pose debug** and:

- Compare raw vs smoothed overlay — smoothed should visibly jitter
  less on the same subject.
- Hide a knee / ankle / shoulder and confirm the occlusion report
  updates and the body status flips between `fully-visible` and
  `partial` honestly.
- Cover both shoulders or both hips and confirm normalization flips to
  `Not normalized` with the matching failure reason.
- Step closer / farther while staying in full view and confirm the
  normalized overlay coordinates remain roughly stable relative to the
  body even though the raw overlay shrinks / grows with distance.
- Watch the **Processing overhead** card and confirm total stays under
  ~2 ms on a normal device.
- Step fully out of frame and confirm the smoother resets — no ghost
  overlay remains, and `Dropped frames` increments.
- **Stop pose debug** and confirm a clean teardown with no lingering
  MediaStream and no stale processed state.

See `docs/SETUP.md §16o` for the full Phase 18 manual QA checklist.
