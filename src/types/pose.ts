/**
 * Phase 17 + 18 — Pose domain types.
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
 *
 * Phase 18 scope:
 * - Add processed-frame types alongside the raw types: smoothed +
 *   normalized landmarks, per-landmark visibility, a structured
 *   visibility report, normalization metadata, processing config /
 *   stats, and a `ProcessedPoseFrame` envelope.
 *
 * Phase 18 still does NOT introduce:
 * - Joint angle types (Phase 19).
 * - Rep state / exercise state machines (Phase 20+).
 * - Form scores or coaching cues.
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

// ---------------------------------------------------------------------------
// Phase 18 — Landmark processing types
// ---------------------------------------------------------------------------

/**
 * Configurable knobs for the Phase 18 landmark processing pipeline.
 * Every value has a safe Motionly-wide default in
 * `src/ml/pose/pose-processing-config.ts`. Per-exercise tuning is a
 * later-phase concern; Phase 18 just exposes the surface.
 */
export type PoseProcessingConfig = {
  /**
   * Exponential Moving Average mixing factor for landmark smoothing.
   * `smoothed = alpha * raw + (1 - alpha) * previous`. Clamped to
   * `[0, 1]`; `1` disables smoothing, `0` would freeze the output.
   */
  smoothingAlpha: number;
  /**
   * Minimum MediaPipe `visibility` (and `presence` when meaningful)
   * for a landmark to count as visible in the confidence filter.
   */
  landmarkVisibilityThreshold: number;
  /**
   * Threshold the averaged key-landmark visibility score must clear
   * for `isBodyFullyVisible` to be `true`.
   */
  bodyVisibilityThreshold: number;
  /**
   * Floor on the computed torso scale (hip-mid → shoulder-mid). Below
   * this Motionly refuses to normalize rather than amplify noise.
   */
  normalizationMinTorsoScale: number;
};

/**
 * Per-landmark visibility tag computed in Phase 18. `presenceUsed`
 * records whether the filter was able to evaluate presence in
 * addition to visibility for this landmark.
 */
export type PoseVisibilityTag = {
  isVisible: boolean;
  visibility: number;
  presence: number;
  presenceUsed: boolean;
};

/**
 * A landmark after Phase 18 smoothing + visibility tagging. The
 * `x/y/z` coordinates are the smoothed values; `rawX/rawY/rawZ`
 * preserve the unsmoothed values for debug rendering and validation.
 */
export type ProcessedPoseLandmark = {
  /** Smoothed x in normalized image space `[0, 1]`. */
  x: number;
  /** Smoothed y in normalized image space `[0, 1]`. */
  y: number;
  /** Smoothed z (depth) in MediaPipe's normalized space. */
  z: number;
  /** MediaPipe visibility, passed through unchanged. */
  visibility: number;
  /** MediaPipe presence (mirrored from visibility today), unchanged. */
  presence: number;
  /** Result of the Phase 18 confidence filter for this landmark. */
  isVisible: boolean;
  rawX: number;
  rawY: number;
  rawZ: number;
  smoothedX: number;
  smoothedY: number;
  smoothedZ: number;
};

/** 33 smoothed/tagged landmarks. */
export type ProcessedPoseLandmarks = ReadonlyArray<ProcessedPoseLandmark>;

/**
 * A landmark expressed in torso-scale-normalized coordinates. Origin
 * is the hip midpoint; one unit ≈ the hip-to-shoulder distance. Z is
 * normalized by the same scale.
 */
export type NormalizedPoseLandmark = {
  normalizedX: number;
  normalizedY: number;
  normalizedZ: number;
  /** Mirrors the Phase 18 visibility tag of the source landmark. */
  isVisible: boolean;
  visibility: number;
  presence: number;
};

/** 33 normalized landmarks. */
export type NormalizedPoseLandmarks = ReadonlyArray<NormalizedPoseLandmark>;

/** Why a normalization attempt failed, when it did. */
export type PoseNormalizationFailureReason =
  | 'no-landmarks'
  | 'key-landmarks-occluded'
  | 'invalid-torso-scale'
  | 'numeric-instability';

/**
 * Metadata describing whether and how Phase 18 normalization landed
 * for one processed frame.
 */
export type PoseNormalizationMetadata =
  | {
      normalized: true;
      torsoScale: number;
      hipCenter: { x: number; y: number; z: number };
      shoulderCenter: { x: number; y: number; z: number };
    }
  | {
      normalized: false;
      reason: PoseNormalizationFailureReason;
    };

/**
 * Named landmark whose Phase 18 visibility tag came back as not
 * visible. Used to drive the debug occlusion report.
 */
export type PoseOcclusionReport = {
  occludedKeyLandmarks: ReadonlyArray<string>;
  occludedLandmarks: ReadonlyArray<string>;
};

/** Per-key-landmark visibility view used by the debug UI. */
export type PoseKeyLandmarkVisibility = {
  name: string;
  visibility: number;
  presence: number;
  isVisible: boolean;
};

/**
 * Aggregate Phase 18 visibility view of a frame. `bodyVisibilityScore`
 * is the unweighted mean of the configured key landmarks' visibility
 * values, in `[0, 1]`.
 */
export type PoseVisibilityReport = {
  /** Mean visibility over the configured key body landmarks `[0, 1]`. */
  bodyVisibilityScore: number;
  /** `true` only when every configured key landmark cleared the threshold. */
  isBodyFullyVisible: boolean;
  /** Count of total landmarks (across all 33) flagged visible this frame. */
  visibleLandmarkCount: number;
  /** Total landmarks evaluated; `0` when no pose was detected. */
  evaluatedLandmarkCount: number;
  /** Names of the key landmarks that did NOT clear the threshold. */
  occludedKeyLandmarks: ReadonlyArray<string>;
  /** Names of all landmarks that did NOT clear the threshold. */
  occludedLandmarks: ReadonlyArray<string>;
  /** Per-key-landmark detail for the debug UI. */
  keyLandmarkVisibility: ReadonlyArray<PoseKeyLandmarkVisibility>;
};

/**
 * Coarse body-visibility status surfaced to the debug UI. `no-pose`
 * means MediaPipe returned no landmarks this frame; `unknown` is the
 * initial state before any frame has been processed.
 */
export type BodyVisibilityStatus = 'unknown' | 'no-pose' | 'partial' | 'fully-visible';

/**
 * Per-frame Phase 18 timing breakdown. All values are in milliseconds
 * and reflect a single processed frame — never an average. The hook
 * adds these to an aggregate `PoseInferenceStats` separately.
 */
export type PoseProcessingStats = {
  smoothingMs: number;
  filteringMs: number;
  normalizationMs: number;
  totalProcessingMs: number;
  processedFrames: number;
  droppedFrames: number;
};

/**
 * Phase 18 processed-frame envelope. Mirrors `PoseFrame` for the same
 * `frameId` / `timestampMs` but carries smoothed + normalized output
 * plus the visibility / normalization / timing metadata. Always
 * contains 33 entries when produced, and `null` otherwise.
 */
export type ProcessedPoseFrame = {
  frameId: number;
  timestampMs: number;
  smoothedLandmarks: ProcessedPoseLandmarks;
  normalizedLandmarks: NormalizedPoseLandmarks | null;
  normalization: PoseNormalizationMetadata;
  visibility: PoseVisibilityReport;
  bodyVisibilityStatus: BodyVisibilityStatus;
  stats: PoseProcessingStats;
};

/**
 * Result returned by `PoseFrameProcessor.process` / `processPoseFrame`.
 * `processed` is `null` when MediaPipe returned no landmarks (the
 * smoother is reset internally so the next detected frame starts
 * cleanly without smoothing into stale state).
 */
export type PoseProcessingResult = {
  raw: PoseFrame;
  processed: ProcessedPoseFrame | null;
};
