/**
 * Phase 19 — Joint angle domain types.
 *
 * Cross-feature public types for the joint-angle calculation layer that
 * consumes Phase 18 processed pose frames and produces named
 * biomechanical angle snapshots. UI components, hooks, and stores
 * depend on these shapes; the math implementation in `src/ml/angles/`
 * never leaks vendor symbols.
 *
 * Phase 19 scope:
 * - Vector-based 2D / 3D joint angle math.
 * - Named joint angles (knee/hip/ankle/elbow/shoulder) bilaterally.
 * - Trunk angle, knee-valgus deviation metric, hip symmetry delta.
 * - Per-frame `AngleSnapshot` and 30-frame `AngleHistory` buffer.
 * - Per-frame calculation overhead stats.
 *
 * Phase 19 still does NOT introduce:
 * - Rep counting / exercise state machines (Phase 20+).
 * - Form scores or coaching cues (Phase 21+).
 * - Per-exercise thresholds — angle values are returned raw, not
 *   classified as "good" or "bad".
 * - Persistence of angle snapshots or history of any kind.
 */

/** Bilateral side selector for paired joint angles. */
export type AngleSide = 'left' | 'right';

/** Unit tag for true vector joint angles. */
export type AngleUnit = 'degrees';

/**
 * Unit tag for geometry-derived metrics that are NOT vector angles —
 * e.g. knee valgus expressed as a normalized lateral deviation, hip
 * symmetry expressed as a normalized height delta. These are always
 * computed in Phase 18 normalized (torso-scale) space, so values are
 * unit-less ratios rather than degrees. Naming them honestly avoids
 * future callers treating a "ratio" as if it were a degree.
 */
export type AngleMetricUnit = 'ratio';

/** Names of the bilateral and unilateral joint angles Phase 19 emits. */
export type JointAngleName =
  | 'leftKnee'
  | 'rightKnee'
  | 'leftHip'
  | 'rightHip'
  | 'leftAnkle'
  | 'rightAnkle'
  | 'leftElbow'
  | 'rightElbow'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'trunk';

/** Names of the non-angle geometry metrics emitted alongside angles. */
export type AngleMetricName = 'leftKneeValgus' | 'rightKneeValgus' | 'hipSymmetry';

/**
 * Why an angle / metric is unavailable for a given frame. Mirrors the
 * Phase 18 normalization failure reasons where possible so callers can
 * trace an unavailable angle back to its root cause without crawling
 * multiple layers.
 */
export type AngleAvailabilityStatus =
  | 'available'
  | 'unavailable'
  | 'key-landmarks-missing'
  | 'key-landmarks-occluded'
  | 'normalization-unavailable'
  | 'numeric-instability';

/**
 * 2D point used as input to `calculateAngle`. Coordinates can be in any
 * consistent space (normalized image space, torso-scale normalized
 * space, etc.) — `calculateAngle` is space-agnostic.
 */
export type AnglePoint2D = {
  x: number;
  y: number;
};

/**
 * 3D point used as input to `calculateAngle3D`. Same space-agnostic
 * contract as `AnglePoint2D` plus a `z` component.
 */
export type AnglePoint3D = {
  x: number;
  y: number;
  z: number;
};

/** Coordinate space the underlying landmarks came from. */
export type AngleSourceSpace = 'normalized' | 'smoothed';

/**
 * A single joint angle value plus the metadata needed to interpret it.
 * `valueDegrees` is `null` when `status !== 'available'`; callers must
 * never fall back to `0` or treat `null` as a numeric default.
 */
export type AngleValue = {
  valueDegrees: number | null;
  status: AngleAvailabilityStatus;
  /** Constant `'degrees'` — included so call sites stay unit-aware. */
  unit: AngleUnit;
  /** Names (matching `POSE_LANDMARK`) of the landmarks fed into the math. */
  usedLandmarks: ReadonlyArray<string>;
  /**
   * Mean Phase 18 visibility of the landmarks actually used. `0` when
   * no landmarks were consulted (e.g. early-exit on missing data).
   */
  visibility: number;
  /** Which Phase 18 coordinate space provided the input. */
  sourceSpace: AngleSourceSpace;
  /** Optional one-line note when status is not `available`. */
  reason?: string;
};

/**
 * Convenience grouping for the paired (left / right) joint angles. The
 * underlying values share input expectations and are commonly read
 * together by debug UI.
 */
export type BilateralAngleValue = {
  left: AngleValue;
  right: AngleValue;
};

/**
 * A geometry-derived metric value that is NOT a vector joint angle.
 * Used for `kneeValgus` (lateral deviation ratio) and `hipSymmetry`
 * (height delta ratio).
 */
export type AngleMetricValue = {
  /** Unit-less ratio in torso-scale normalized space, or `null`. */
  value: number | null;
  status: AngleAvailabilityStatus;
  unit: AngleMetricUnit;
  usedLandmarks: ReadonlyArray<string>;
  visibility: number;
  sourceSpace: AngleSourceSpace;
  reason?: string;
};

/**
 * Aggregate availability view for one frame — how many tracked angles
 * + metrics came back as `available` vs unavailable. Powers the debug
 * card without consumers needing to walk every field.
 */
export type AngleAvailabilityReport = {
  availableAngleCount: number;
  unavailableAngleCount: number;
  availableMetricCount: number;
  unavailableMetricCount: number;
  /** Names of unavailable angles for the debug card. */
  unavailableAngles: ReadonlyArray<JointAngleName>;
  /** Names of unavailable metrics for the debug card. */
  unavailableMetrics: ReadonlyArray<AngleMetricName>;
  /**
   * When `false`, normalization was unavailable for this frame; angles
   * that strictly require normalized landmarks will return unavailable.
   */
  normalizationAvailable: boolean;
};

/**
 * Per-frame angle calculation overhead. All values are milliseconds
 * measured with `performance.now()` and represent the latest frame
 * only — never a running average.
 */
export type AngleCalculationStats = {
  /** Time spent computing the angle snapshot, in ms. */
  totalCalculationMs: number;
  /** Total angle snapshots produced since the processor started. */
  snapshotsProduced: number;
  /** Frames where no processed pose frame was available to consume. */
  framesSkipped: number;
  /** Current size of the bounded `AngleHistory` ring buffer. */
  historySize: number;
  /** Configured capacity of the `AngleHistory` ring buffer. */
  historyCapacity: number;
};

/**
 * The full per-frame angle snapshot produced by the Phase 19 processor.
 *
 * Field naming is honest about what each value really is:
 * - `leftKnee`, `rightKnee`, `leftHip`, `rightHip`, `leftAnkle`,
 *   `rightAnkle`, `leftElbow`, `rightElbow`, `leftShoulder`,
 *   `rightShoulder` and `trunkAngle` are true vector angles in degrees.
 * - `leftKneeValgusRatio`, `rightKneeValgusRatio` and `hipSymmetryDelta`
 *   are normalized ratios, NOT degrees — even though the underlying
 *   helpers are named `kneeValgus(side)` and `hipSymmetry()`.
 */
export type AngleSnapshot = {
  /** Sequential frame id, mirrors `ProcessedPoseFrame.frameId`. */
  frameId: number;
  /** Frame timestamp in ms, mirrors `ProcessedPoseFrame.timestampMs`. */
  timestampMs: number;
  /** Vector joint angles. */
  leftKnee: AngleValue;
  rightKnee: AngleValue;
  leftHip: AngleValue;
  rightHip: AngleValue;
  leftAnkle: AngleValue;
  rightAnkle: AngleValue;
  leftElbow: AngleValue;
  rightElbow: AngleValue;
  leftShoulder: AngleValue;
  rightShoulder: AngleValue;
  trunkAngle: AngleValue;
  /** Geometry-derived metrics (ratios, not degrees). */
  leftKneeValgusRatio: AngleMetricValue;
  rightKneeValgusRatio: AngleMetricValue;
  hipSymmetryDelta: AngleMetricValue;
  /** Aggregate availability view for this snapshot. */
  availability: AngleAvailabilityReport;
};

/**
 * Result returned by `AngleFrameProcessor.process` /
 * `processAngleSnapshot`. `snapshot` is `null` when the processed pose
 * frame was missing — Phase 19 deliberately does not invent values.
 */
export type AngleCalculationResult = {
  snapshot: AngleSnapshot | null;
  stats: AngleCalculationStats;
};

/**
 * One entry in the bounded angle history ring buffer. Includes the
 * snapshot plus the wall-clock time it was pushed for debug display.
 */
export type AngleHistoryEntry = {
  pushedAtMs: number;
  snapshot: AngleSnapshot;
};

/** Read-only view of the angle history buffer, used by the debug UI. */
export type AngleHistoryState = {
  capacity: number;
  size: number;
  latest: AngleSnapshot | null;
  entries: ReadonlyArray<AngleHistoryEntry>;
};
