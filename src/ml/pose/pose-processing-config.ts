/**
 * Phase 18 — Landmark processing configuration.
 *
 * Centralized defaults for the smoothing / confidence-filter /
 * normalization pipeline. Keep constants here rather than scattering
 * literals across the smoother, filter, normalizer, and processor.
 *
 * Per-exercise tuning (e.g. tighter visibility threshold for squat
 * depth detection, different alpha for fast movements) is intentionally
 * deferred to later phases. Phase 18 only ships the surface and a
 * single set of conservative defaults that work for standing poses
 * filmed from ~2m away.
 */

import { POSE_LANDMARK } from '@ml/pose/landmark-names';
import type { PoseLandmarkIndex, PoseLandmarkName } from '@ml/pose/landmark-names';
import type { PoseProcessingConfig } from '@/types/pose';

/**
 * Exponential Moving Average mixing factor:
 * `smoothed = alpha * raw + (1 - alpha) * previous`.
 *
 * `0.5` is the master-plan-documented Phase 18 default — equal weight
 * between the live frame and the smoothed history. Lower values smooth
 * harder (more lag); higher values smooth less.
 */
export const DEFAULT_SMOOTHING_ALPHA = 0.5;

/**
 * Per-landmark MediaPipe visibility threshold. Below this we treat the
 * landmark as occluded for Phase 18 visibility reporting. Master plan
 * documents `0.6` as the Phase 18 default.
 */
export const DEFAULT_LANDMARK_VISIBILITY_THRESHOLD = 0.6;

/**
 * Whole-body visibility threshold: the mean of the configured key
 * landmark visibilities must clear this for `isBodyFullyVisible`. Kept
 * at the same conservative `0.6` floor — Phase 18 reports state but
 * does not gate downstream phases.
 */
export const DEFAULT_BODY_VISIBILITY_THRESHOLD = 0.6;

/**
 * Floor on the computed torso scale (hip midpoint → shoulder midpoint
 * distance, in normalized image space). If the scale falls below this
 * epsilon the normalizer refuses to divide rather than amplifying
 * noise into infinity. `1e-3` is comfortably below any realistic torso
 * height even for partially in-frame subjects.
 */
export const DEFAULT_NORMALIZATION_MIN_TORSO_SCALE = 1e-3;

/**
 * Key body landmarks the Phase 18 confidence filter averages for the
 * whole-body visibility score, and that the visibility report calls
 * out individually. Mirrors the master-plan list — shoulders, hips,
 * knees, ankles. Wrists / elbows are intentionally excluded from the
 * "is the body fully visible?" calculation so squats with arms folded
 * don't flag as partial; they're still tagged per-landmark by the
 * filter and surfaced in the broader occlusion list.
 */
export const POSE_BODY_VISIBILITY_LANDMARKS: ReadonlyArray<PoseLandmarkIndex> = [
  POSE_LANDMARK.LEFT_SHOULDER,
  POSE_LANDMARK.RIGHT_SHOULDER,
  POSE_LANDMARK.LEFT_HIP,
  POSE_LANDMARK.RIGHT_HIP,
  POSE_LANDMARK.LEFT_KNEE,
  POSE_LANDMARK.RIGHT_KNEE,
  POSE_LANDMARK.LEFT_ANKLE,
  POSE_LANDMARK.RIGHT_ANKLE,
];

/** Names matching `POSE_BODY_VISIBILITY_LANDMARKS`, in the same order. */
export const POSE_BODY_VISIBILITY_LANDMARK_NAMES: ReadonlyArray<PoseLandmarkName> = [
  'LEFT_SHOULDER',
  'RIGHT_SHOULDER',
  'LEFT_HIP',
  'RIGHT_HIP',
  'LEFT_KNEE',
  'RIGHT_KNEE',
  'LEFT_ANKLE',
  'RIGHT_ANKLE',
];

/** The single Motionly-wide default Phase 18 processing config. */
export const DEFAULT_POSE_PROCESSING_CONFIG: PoseProcessingConfig = {
  smoothingAlpha: DEFAULT_SMOOTHING_ALPHA,
  landmarkVisibilityThreshold: DEFAULT_LANDMARK_VISIBILITY_THRESHOLD,
  bodyVisibilityThreshold: DEFAULT_BODY_VISIBILITY_THRESHOLD,
  normalizationMinTorsoScale: DEFAULT_NORMALIZATION_MIN_TORSO_SCALE,
};

/**
 * Clamp `alpha` into the safe `[0, 1]` range used by the EMA smoother.
 * Returns the Phase 18 default when given a non-finite value rather
 * than letting NaN poison the smoothing state.
 */
export function clampSmoothingAlpha(alpha: number): number {
  if (!Number.isFinite(alpha)) {
    return DEFAULT_SMOOTHING_ALPHA;
  }
  if (alpha <= 0) {
    return 0;
  }
  if (alpha >= 1) {
    return 1;
  }
  return alpha;
}

/**
 * Clamp a `[0, 1]` confidence threshold (visibility / presence) into a
 * safe range. Falls back to the Phase 18 default on non-finite input.
 */
export function clampVisibilityThreshold(
  threshold: number,
  fallback: number = DEFAULT_LANDMARK_VISIBILITY_THRESHOLD,
): number {
  if (!Number.isFinite(threshold)) {
    return fallback;
  }
  if (threshold <= 0) {
    return 0;
  }
  if (threshold >= 1) {
    return 1;
  }
  return threshold;
}

/**
 * Normalize a partial Phase 18 config against the defaults. Caller
 * code stays declarative — pass overrides only for the knobs you care
 * about and let the helper fill in the rest.
 */
export function resolvePoseProcessingConfig(
  overrides?: Partial<PoseProcessingConfig>,
): PoseProcessingConfig {
  if (overrides === undefined) {
    return { ...DEFAULT_POSE_PROCESSING_CONFIG };
  }
  return {
    smoothingAlpha: clampSmoothingAlpha(
      overrides.smoothingAlpha ?? DEFAULT_POSE_PROCESSING_CONFIG.smoothingAlpha,
    ),
    landmarkVisibilityThreshold: clampVisibilityThreshold(
      overrides.landmarkVisibilityThreshold ??
        DEFAULT_POSE_PROCESSING_CONFIG.landmarkVisibilityThreshold,
      DEFAULT_POSE_PROCESSING_CONFIG.landmarkVisibilityThreshold,
    ),
    bodyVisibilityThreshold: clampVisibilityThreshold(
      overrides.bodyVisibilityThreshold ?? DEFAULT_POSE_PROCESSING_CONFIG.bodyVisibilityThreshold,
      DEFAULT_POSE_PROCESSING_CONFIG.bodyVisibilityThreshold,
    ),
    normalizationMinTorsoScale:
      Number.isFinite(overrides.normalizationMinTorsoScale ?? NaN) &&
      (overrides.normalizationMinTorsoScale as number) > 0
        ? (overrides.normalizationMinTorsoScale as number)
        : DEFAULT_POSE_PROCESSING_CONFIG.normalizationMinTorsoScale,
  };
}
