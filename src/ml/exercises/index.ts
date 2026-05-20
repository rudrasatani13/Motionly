/**
 * Phase 20 — Exercise-engine public surface.
 *
 * Single entry point for consumers (`@ml/exercises`) so the hook, debug
 * UI, and active route never depend on internal file layout.
 */

export { DEFAULT_SQUAT_ENGINE_CONFIG, bottomThresholdForDifficulty } from './squat-config';
export { SquatEngine, type SquatEngineOptions } from './SquatEngine';
export {
  averageNonNull,
  getAverageKneeAngle,
  getLeftKneeDegrees,
  getLeftKneeValgusRatio,
  getMaxValgusRatio,
  getMinAvailableKneeAngle,
  getRightKneeDegrees,
  getRightKneeValgusRatio,
  getTrunkDegrees,
  isAngleAvailable,
  isMetricAvailable,
  kneesAboveStanding,
  kneesBelowBottom,
  safeMax,
  safeMaxByMagnitude,
  safeMin,
} from './squat-utils';
