/**
 * Phase 20 — Squat engine configuration.
 *
 * Central place for the squat rep-detection knobs. Phase 20 keeps the
 * thresholds aligned with the master plan:
 *
 * - Standing threshold: knee angle ≥ 160° (full extension).
 * - Beginner bottom: knee angle < 110°.
 * - Intermediate bottom: knee angle < 90°.
 * - Minimum 15-frame dwell at BOTTOM before a rep becomes eligible
 *   (≈ 0.5 s at ~30 FPS — the master-plan-documented hysteresis).
 * - Conservative duration bounds keep clearly-not-a-rep transitions
 *   (instantaneous bounces, ten-second pauses) from counting.
 *
 * Per-user / adaptive tuning is intentionally deferred to Phase 24+.
 * Form-scoring thresholds and coaching-cue thresholds belong to
 * Phase 21+ and must NOT be added here.
 */

import type { SquatDifficulty, SquatEngineConfig } from '@/types/squat';

/** Squat engine defaults documented in `MOTIONLY_MASTER_PLAN.md` Phase 20. */
export const DEFAULT_SQUAT_ENGINE_CONFIG: SquatEngineConfig = {
  standingKneeAngleDegrees: 160,
  beginnerBottomKneeAngleDegrees: 110,
  intermediateBottomKneeAngleDegrees: 90,
  minimumBottomDwellFrames: 15,
  minRepDurationMs: 700,
  maxRepDurationMs: 10_000,
  visibilityRequired: true,
  defaultDifficulty: 'beginner',
};

/**
 * Returns the bottom-depth knee-angle threshold for the chosen
 * difficulty. Intermediate goes lower (deeper squat); beginner is more
 * forgiving.
 */
export function bottomThresholdForDifficulty(
  difficulty: SquatDifficulty,
  config: SquatEngineConfig = DEFAULT_SQUAT_ENGINE_CONFIG,
): number {
  return difficulty === 'intermediate'
    ? config.intermediateBottomKneeAngleDegrees
    : config.beginnerBottomKneeAngleDegrees;
}
