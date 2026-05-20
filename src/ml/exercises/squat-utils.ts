/**
 * Phase 20 — Pure squat utility helpers.
 *
 * Tiny, dependency-free functions used by the squat state machine and
 * the squat debug surface. No React, no DOM, no MediaPipe, no
 * persistence, no logging — every helper is a pure function.
 */

import type { AngleMetricValue, AngleSnapshot, AngleValue } from '@/types/angles';
import type { SquatEngineConfig } from '@/types/squat';

/** Type guard: an `AngleValue` is usable when it reports a finite degree. */
export function isAngleAvailable(
  value: AngleValue | undefined,
): value is AngleValue & { valueDegrees: number } {
  return (
    value !== undefined &&
    value.status === 'available' &&
    value.valueDegrees !== null &&
    Number.isFinite(value.valueDegrees)
  );
}

/** Type guard: an `AngleMetricValue` is usable when it reports a finite ratio. */
export function isMetricAvailable(
  metric: AngleMetricValue | undefined,
): metric is AngleMetricValue & { value: number } {
  return (
    metric !== undefined &&
    metric.status === 'available' &&
    metric.value !== null &&
    Number.isFinite(metric.value)
  );
}

/** Pull the left-knee angle in degrees if it's usable for this frame. */
export function getLeftKneeDegrees(snapshot: AngleSnapshot): number | null {
  return isAngleAvailable(snapshot.leftKnee) ? snapshot.leftKnee.valueDegrees : null;
}

/** Pull the right-knee angle in degrees if it's usable for this frame. */
export function getRightKneeDegrees(snapshot: AngleSnapshot): number | null {
  return isAngleAvailable(snapshot.rightKnee) ? snapshot.rightKnee.valueDegrees : null;
}

/** Pull the trunk angle in degrees if it's usable for this frame. */
export function getTrunkDegrees(snapshot: AngleSnapshot): number | null {
  return isAngleAvailable(snapshot.trunkAngle) ? snapshot.trunkAngle.valueDegrees : null;
}

/** Pull the left knee valgus ratio if it's usable for this frame. */
export function getLeftKneeValgusRatio(snapshot: AngleSnapshot): number | null {
  return isMetricAvailable(snapshot.leftKneeValgusRatio)
    ? snapshot.leftKneeValgusRatio.value
    : null;
}

/** Pull the right knee valgus ratio if it's usable for this frame. */
export function getRightKneeValgusRatio(snapshot: AngleSnapshot): number | null {
  return isMetricAvailable(snapshot.rightKneeValgusRatio)
    ? snapshot.rightKneeValgusRatio.value
    : null;
}

/**
 * Average left + right knee angles when both are usable, fall back to
 * whichever side is available, or `null` if neither is. The squat
 * engine prefers this over the per-side reads because it is the input
 * most state transitions are conditioned on.
 */
export function getAverageKneeAngle(snapshot: AngleSnapshot): number | null {
  const left = getLeftKneeDegrees(snapshot);
  const right = getRightKneeDegrees(snapshot);
  if (left !== null && right !== null) {
    return (left + right) / 2;
  }
  if (left !== null) {
    return left;
  }
  if (right !== null) {
    return right;
  }
  return null;
}

/** Whichever side's knee is more flexed (smaller angle), or `null`. */
export function getMinAvailableKneeAngle(snapshot: AngleSnapshot): number | null {
  const left = getLeftKneeDegrees(snapshot);
  const right = getRightKneeDegrees(snapshot);
  if (left !== null && right !== null) {
    return left <= right ? left : right;
  }
  return left !== null ? left : right;
}

/** Max of available knee valgus ratios (by magnitude), or `null`. */
export function getMaxValgusRatio(snapshot: AngleSnapshot): number | null {
  const left = getLeftKneeValgusRatio(snapshot);
  const right = getRightKneeValgusRatio(snapshot);
  if (left !== null && right !== null) {
    return Math.abs(left) >= Math.abs(right) ? left : right;
  }
  return left !== null ? left : right;
}

/**
 * True when *both* knees are at or above the standing-extension
 * threshold. The squat engine treats this as the only safe initial /
 * end-of-rep state — single-side data is not sufficient.
 */
export function kneesAboveStanding(snapshot: AngleSnapshot, config: SquatEngineConfig): boolean {
  const left = getLeftKneeDegrees(snapshot);
  const right = getRightKneeDegrees(snapshot);
  if (left === null || right === null) {
    return false;
  }
  return left >= config.standingKneeAngleDegrees && right >= config.standingKneeAngleDegrees;
}

/**
 * True when *both* knees are at or below the configured bottom-depth
 * threshold. Requires both sides because a unilateral collapse should
 * not be counted as reaching squat depth.
 */
export function kneesBelowBottom(snapshot: AngleSnapshot, bottomThresholdDegrees: number): boolean {
  const left = getLeftKneeDegrees(snapshot);
  const right = getRightKneeDegrees(snapshot);
  if (left === null || right === null) {
    return false;
  }
  return left < bottomThresholdDegrees && right < bottomThresholdDegrees;
}

/** Average a list of numbers, ignoring nulls; returns `null` when empty. */
export function averageNonNull(values: ReadonlyArray<number | null>): number | null {
  let total = 0;
  let count = 0;
  for (const value of values) {
    if (value !== null && Number.isFinite(value)) {
      total += value;
      count += 1;
    }
  }
  return count === 0 ? null : total / count;
}

/** `Math.min` that respects `null` for "no sample yet". */
export function safeMin(a: number | null, b: number | null): number | null {
  if (a === null) {
    return b;
  }
  if (b === null) {
    return a;
  }
  return a <= b ? a : b;
}

/** `Math.max` that respects `null` for "no sample yet". */
export function safeMax(a: number | null, b: number | null): number | null {
  if (a === null) {
    return b;
  }
  if (b === null) {
    return a;
  }
  return a >= b ? a : b;
}

/**
 * "Same-sign max-by-magnitude" — used for valgus ratios where the sign
 * carries meaning (positive = cave-in). Returns the larger-magnitude
 * value while preserving its sign.
 */
export function safeMaxByMagnitude(a: number | null, b: number | null): number | null {
  if (a === null) {
    return b;
  }
  if (b === null) {
    return a;
  }
  return Math.abs(a) >= Math.abs(b) ? a : b;
}
