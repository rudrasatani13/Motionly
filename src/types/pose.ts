/**
 * Phase 17 — Pose domain types.
 *
 * Cross-feature public types for the MediaPipe Pose Landmarker
 * integration. UI components, hooks, and stores depend on these
 * shapes; the MediaPipe-specific implementation in `src/ml/pose/`
 * converts vendor result objects into these Motionly types so the
 * rest of the app does not leak vendor symbols.
 *
 * Phase 17 scope:
 * - Real MediaPipe landmark output (33 points) flowing into UI for
 *   debug rendering, plus FPS / inference timing stats.
 * - No smoothing, no normalization, no joint-angle math, no rep
 *   detection, no form scoring, no session/history records.
 */

/**
 * Which Pose Landmarker model file Motionly loads. The lite model
 * is the mobile-friendly default; full is optional and used only
 * if explicitly requested.
 */
export type PoseModelVariant = 'lite' | 'full';

/** MediaPipe inference delegate Motionly asked for / fell back to. */
export type PoseDelegate = 'gpu' | 'cpu';

/**
 * High-level inference status surfaced to the UI. Honest names only —
 * `no-pose` means MediaPipe returned an empty landmark list this frame,
 * not that we faked a body.
 */
export type PoseInferenceStatus =
  | 'idle'
  | 'loading-model'
  | 'ready'
  | 'running'
  | 'no-pose'
  | 'error';

/** Categorized initialization / runtime failure kinds. */
export type PoseInferenceErrorKind =
  | 'model-missing'
  | 'model-fetch-failed'
  | 'wasm-load-failed'
  | 'gpu-init-failed'
  | 'cpu-init-failed'
  | 'unsupported-browser'
  | 'inference-failed'
  | 'unknown';

export type PoseInferenceError = {
  kind: PoseInferenceErrorKind;
  message: string;
};

/**
 * A single 2D-projected pose landmark in normalized image space
 * `[0, 1]` for `x` and `y`, with depth `z` (negative is toward camera
 * for MediaPipe). `visibility` and `presence` are MediaPipe-reported
 * `[0, 1]` confidences — never fabricated.
 */
export type PoseLandmark = {
  x: number;
  y: number;
  z: number;
  visibility: number;
  presence: number;
};

/**
 * 3D world landmark in meters, centered roughly on the subject's hips.
 * Motionly does not yet convert these to joint angles; Phase 19 owns
 * angle math.
 */
export type PoseWorldLandmark = {
  x: number;
  y: number;
  z: number;
  visibility: number;
  presence: number;
};

/** Tuple of 33 normalized image-space landmarks (MediaPipe Pose). */
export type PoseLandmarks = ReadonlyArray<PoseLandmark>;

/** Tuple of 33 world-space landmarks if MediaPipe returns them. */
export type PoseWorldLandmarks = ReadonlyArray<PoseWorldLandmark>;

/**
 * A single converted pose result for one frame, derived directly from
 * MediaPipe output for that frame. No smoothing, no normalization, no
 * derived joint angles, no rep state, no form score.
 */
export type PoseFrame = {
  /** Sequential id, 1-based, incrementing per emitted frame. */
  frameId: number;
  /** Timestamp passed to / returned from MediaPipe in ms. */
  timestampMs: number;
  /** 33 landmarks. Always length 33 when a body was detected. */
  landmarks: PoseLandmarks;
  /** 33 world landmarks if MediaPipe returned them this frame. */
  worldLandmarks: PoseWorldLandmarks | null;
  /** How long `detectForVideo` took for this frame, in ms. */
  inferenceMs: number;
  /** Rolling FPS estimate from the inference loop. */
  fps: number;
};

/** Live performance / health stats from the inference loop. */
export type PoseInferenceStats = {
  /** Rolling FPS over the last ~1 second of emitted frames. */
  fps: number;
  /** Latest single-frame inference duration in ms. */
  lastInferenceMs: number;
  /** Average inference duration over the rolling window, in ms. */
  averageInferenceMs: number;
  /** Total frames processed by `detectForVideo` since start. */
  framesProcessed: number;
  /** Frames where the video had no new currentTime to process. */
  framesSkipped: number;
  /** Wall-clock ms it took to load the active model file. */
  modelLoadMs: number | null;
};

/**
 * Raw conversion result from the MediaPipe wrapper. UI code consumes
 * this through the Phase 17 hook / store; it never imports
 * `@mediapipe/tasks-vision` symbols directly.
 */
export type PoseDetectionResult = {
  timestampMs: number;
  inferenceMs: number;
  /** Empty array means MediaPipe returned no pose for this frame. */
  landmarks: PoseLandmarks;
  worldLandmarks: PoseWorldLandmarks | null;
};
