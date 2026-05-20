# `src/ml/angles/`

Joint angle calculations layered on top of the Phase 18 processed pose
frame. Pure TypeScript math + a small in-memory ring buffer; no React,
no DOM, no MediaPipe imports, no network, no persistence.

## What belongs here

- **Phase 19 — Joint angle math.**
  - `AngleCalculator.ts` — pure 2D / 3D vector angle math:
    `calculateAngle(pointA, vertex, pointC)`,
    `calculateAngle3D(...)`, `angleFromVertical2D(...)`, plus dot /
    length / clamp / radians helpers. Clamps cosine to `[-1, 1]`,
    handles zero-length vectors safely, and never returns
    `NaN` / `Infinity` — every helper has a tagged failure result.
  - `JointAngles.ts` — named joint angle and metric helpers that
    consume a Phase 18 `ProcessedPoseFrame`:
    `kneeAngle(side)`, `hipAngle(side)`, `ankleAngle(side)`,
    `elbowAngle(side)`, `shoulderAngle(side)`, `trunkAngle()`,
    `kneeValgus(side)`, `hipSymmetry()`. Prefers normalized landmarks
    where they're required (valgus, symmetry) and uses smoothed
    landmarks for vector angles when that's safe (vector angles are
    scale-invariant). Honors Phase 18 `isVisible` tags — any occluded
    required landmark short-circuits to a typed unavailable result.
  - `AngleHistory.ts` — bounded ring buffer for `AngleSnapshot`s.
    Default capacity 30. `push` / `latest` / `getAll` / `getRecent` /
    `clear` / `size` / `capacity` / `toState`. No persistence; resets
    on stop / unmount / model restart / no-pose frame.
  - `processAngleSnapshot.ts` — `AngleFrameProcessor` class that owns
    the `AngleHistory`, runs every joint helper against the processed
    frame, measures total per-frame overhead with `performance.now()`,
    and returns an `AngleCalculationResult`. Functional
    `processAngleSnapshot(processor, processed)` wrapper mirrors the
    Phase 18 `processPoseFrame` shape.
  - `angle-config.ts` — angle-layer defaults
    (`DEFAULT_ANGLE_HISTORY_CAPACITY`,
    `DEFAULT_ANGLE_VISIBILITY_THRESHOLD`). Mirrors the Phase 18
    visibility floor so the layers stay in sync.

## What does NOT belong here

- Camera access — the platform adapter in `src/platform/camera-stream.ts`.
- Drawing the skeleton overlay — UI lives in `src/components/pose-debug/`.
- Exercise rep counting or form rules — Phase 20+, lives in
  `src/ml/exercises/`.
- Form scoring or coaching cues — Phase 21+.
- Workout session state, history, persistence, analytics — out of scope
  forever in this layer.

## Coordinate space contract

Every angle / metric helper takes Phase 18 outputs:

- `smoothedLandmarks` — image-space, scale-invariant in _angle_ terms.
  Vector joint angles (knee, hip, ankle, elbow, shoulder) read from
  this space.
- `normalizedLandmarks` — torso-scale, hip-mid origin. Required for any
  metric that compares positions across the body
  (`kneeValgus`, `hipSymmetry`) because raw image-space pixels conflate
  camera distance with deviation magnitude. `trunkAngle` prefers this
  space when available and falls back to smoothed image-space when
  Phase 18 normalization is unavailable for the frame.

The `sourceSpace` field on every `AngleValue` / `AngleMetricValue`
records which space the helper used, so the debug UI stays honest.

## What each angle / metric means

- `kneeAngle(side)` — hip → knee → ankle vector angle. `~180°` =
  fully extended; lower values = flexed (squatting).
- `hipAngle(side)` — shoulder → hip → knee vector angle. `~180°` =
  standing tall; lower values = bent forward at the hip.
- `ankleAngle(side)` — knee → ankle → foot_index vector angle.
  Approximates dorsiflexion / plantarflexion when filmed from the side.
- `elbowAngle(side)` — shoulder → elbow → wrist. `~180°` = arm
  extended; lower = bent.
- `shoulderAngle(side)` — hip → shoulder → elbow. Useful for upper-body
  exercises in later phases.
- `trunkAngle()` — angular deviation of the shoulder-mid → hip-mid
  vector from screen-vertical. `0°` = upright relative to the camera
  frame. Larger values = forward / backward / sideways lean.
- `kneeValgus(side)` — signed perpendicular offset of the knee from
  the hip → ankle line, divided by hip → ankle length, in torso-scale
  normalized space. **Unit-less ratio**, NOT degrees. Positive values
  mean the knee deviates toward the body midline (cave-in / valgus).
- `hipSymmetry()` — left/right hip vertical height difference,
  normalized by hip width, in torso-scale normalized space. **Unit-less
  ratio**, NOT degrees. Positive values mean the right hip sits higher
  than the left in image space.

## Per-frame flow

For each Phase 18 `ProcessedPoseFrame`:

1. `AngleFrameProcessor.process(processed)` is called from the hook.
2. The processor computes every named angle / metric. Each returns a
   typed `AngleValue` / `AngleMetricValue` with its own availability
   status — `available`, `key-landmarks-missing`,
   `key-landmarks-occluded`, `normalization-unavailable`, or
   `numeric-instability`. Unavailable results carry `null` values.
3. The aggregate `AngleAvailabilityReport` summarizes how many angles
   and metrics came back as available, which did not, and whether
   normalization was usable for the frame.
4. The snapshot is pushed onto the bounded `AngleHistory` ring buffer.
5. A single `AngleCalculationResult` (snapshot + stats) is returned to
   the hook, which writes the latest snapshot + small stats object
   into the pose store.

On a `null` processed frame (Phase 18 reported no pose), the processor
clears its history and returns `snapshot: null`. The hook reflects this
in the store; the debug UI shows "Waiting for pose" instead of stale
angles.

## Intentionally deferred

- Rep counting / squat engine — Phase 20.
- Form rules / cue prioritization / form score — Phase 21.
- Coaching voice cues — Phase 25.
- Final skeleton overlay — Phase 26.
- Persistence of angle history of any kind. Phase 19's history lives
  in memory and resets on stop / unmount / model restart / no-pose.

## How to manually validate Phase 19

Run `pnpm preview`, navigate through onboarding → workout library →
free workout → camera setup → active, then **Start pose debug** and:

- Stand upright and confirm `Left knee` / `Right knee` /
  `Left hip` / `Right hip` are biomechanically plausible (knees and
  hips near `~170–180°` when extended).
- Squat down and confirm both knee angles drop toward the
  `~70–100°` range at the bottom of the rep.
- Intentionally let your knees cave inward and confirm `Left knee
valgus` / `Right knee valgus` magnitudes increase.
- Cover one shoulder or hip and confirm the dependent angles flip to
  an unavailable status with the matching reason (e.g.
  `occluded`).
- Step out of frame and confirm the history resets to `0 / 30` and the
  snapshot returns to `Waiting for pose`.
- Watch the **Angle calculation overhead** card and confirm the
  per-frame total stays under ~1 ms.
- **Stop pose debug** and confirm a clean teardown with no stale
  snapshot, no stale stats, and `0` history size.

See `docs/SETUP.md` for the full Phase 19 manual QA checklist.
