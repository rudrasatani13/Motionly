/**
 * Shared score / tone helpers for Phase 9 feedback components.
 *
 * Motionly maps a numeric form / progress score (0–100) onto three
 * semantic tones so every score display in the app agrees on which
 * range is "good", "warning", or "danger". Components import the
 * helpers below; they never re-implement the thresholds inline.
 *
 * Rules:
 * - Never invent a score. The helpers consume a numeric value passed
 *   in by the caller — they do not generate one.
 * - Tone is semantic, not visual. The Tailwind classes for each tone
 *   live alongside the consuming component so this module stays
 *   color-free.
 * - Invalid numbers (`NaN`, `Infinity`, non-finite values) are treated
 *   defensively — `clampScore` returns `0` and `scoreTone` returns
 *   `'danger'` so the UI degrades to a clearly bad state instead of
 *   crashing.
 */

/** Semantic tone associated with a numeric score range. */
export type ScoreTone = 'good' | 'warning' | 'danger';

/** Inclusive minimum score that still counts as `good` (≥ 80). */
export const SCORE_GOOD_THRESHOLD = 80;

/** Inclusive minimum score that still counts as `warning` (50 ≤ s < 80). */
export const SCORE_WARNING_THRESHOLD = 50;

/** Hard upper / lower bounds for any clamped score. */
export const SCORE_MIN = 0;
export const SCORE_MAX = 100;

/**
 * Clamp a numeric score into the canonical 0–100 range.
 *
 * Returns `SCORE_MIN` for `NaN`, non-finite, or otherwise unusable
 * inputs so callers can safely use the result as `aria-valuenow`.
 */
export function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return SCORE_MIN;
  }
  if (value < SCORE_MIN) {
    return SCORE_MIN;
  }
  if (value > SCORE_MAX) {
    return SCORE_MAX;
  }
  return value;
}

/**
 * Map a (pre-clamped) numeric score to its semantic tone:
 *
 * - `good` for `score >= 80`
 * - `warning` for `50 <= score < 80`
 * - `danger` for `score < 50`
 *
 * Non-finite inputs collapse to `danger` so the UI never silently
 * shows a "good" badge for a broken value.
 */
export function scoreTone(score: number): ScoreTone {
  if (!Number.isFinite(score)) {
    return 'danger';
  }
  if (score >= SCORE_GOOD_THRESHOLD) {
    return 'good';
  }
  if (score >= SCORE_WARNING_THRESHOLD) {
    return 'warning';
  }
  return 'danger';
}

/**
 * Clamp a 0–100 progress value the same way as `clampScore`. Kept as
 * a separate name so consumers can express intent — progress and score
 * happen to share a range today but may diverge later.
 */
export function clampProgress(value: number): number {
  return clampScore(value);
}
