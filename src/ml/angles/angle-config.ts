/**
 * Phase 19 — Joint angle / metric configuration.
 *
 * Central place for default knobs the angle layer uses. Phase 19 ships
 * very few knobs on purpose — angle math is unit-aware and only needs
 * a default history capacity and a per-landmark visibility floor that
 * mirrors the Phase 18 confidence filter so the two layers agree on
 * "visible enough to use".
 *
 * Per-exercise tuning (e.g. tighter visibility for squat valgus
 * detection, or different visibility thresholds for arm vs leg angles)
 * is intentionally deferred to Phase 21+.
 */

import { DEFAULT_LANDMARK_VISIBILITY_THRESHOLD } from '@ml/pose/pose-processing-config';

/**
 * Default capacity of the bounded `AngleHistory` ring buffer.
 *
 * Master-plan-documented Phase 19 value: 30 frames, which at
 * ~25–30 FPS is roughly a one-second sliding window. Long enough to
 * smooth a future Phase 21 form rule, short enough that nothing can
 * accumulate into an unbounded memory hog.
 */
export const DEFAULT_ANGLE_HISTORY_CAPACITY = 30;

/**
 * Per-landmark visibility floor for the angle layer. Mirrors the
 * Phase 18 default so the two layers stay in sync; callers can pass an
 * override (e.g. a tighter floor for valgus detection) without
 * touching Phase 18 config.
 */
export const DEFAULT_ANGLE_VISIBILITY_THRESHOLD = DEFAULT_LANDMARK_VISIBILITY_THRESHOLD;
