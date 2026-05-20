/**
 * Phase 18 — Exponential Moving Average landmark smoother.
 *
 * Wraps MediaPipe's per-frame landmark output with a per-axis EMA
 * filter so downstream code does not have to deal with the visible
 * jitter the raw model emits. The smoother is the only stateful piece
 * of the Phase 18 pipeline; it holds the previous frame's smoothed
 * values and combines them with the current raw values:
 *
 *   smoothed = alpha * raw + (1 - alpha) * previous
 *
 * Important rules this file enforces:
 *
 * - **No fabricated landmarks.** If MediaPipe returns fewer than 33
 *   landmarks (the common Phase 17 "no-pose" case), the smoother
 *   resets its internal state and returns `null`. It does NOT pad
 *   missing landmarks with the previous frame's coordinates.
 * - **No fabricated visibility.** Visibility / presence values pass
 *   through unchanged. The smoother does not blur the confidence
 *   signal — Phase 18 keeps that honest.
 * - **No coaching, no scoring.** Smoothing is purely numeric; it does
 *   not derive form cues, rep counts, or "AI confidence".
 *
 * The smoother is intentionally not a React hook. The pose hook owns
 * one instance per active inference session and calls `reset()` on
 * no-pose / stop / unmount.
 */

import { clampSmoothingAlpha, DEFAULT_SMOOTHING_ALPHA } from '@ml/pose/pose-processing-config';
import { POSE_LANDMARK_COUNT } from '@ml/pose/landmark-names';
import type { PoseLandmarks, ProcessedPoseLandmark } from '@/types/pose';

type SmoothingConfig = {
  alpha?: number;
};

/** Smoothed coordinates from the previous frame, retained per landmark. */
type SmoothedState = {
  x: number;
  y: number;
  z: number;
};

function safeCoordinate(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function safeConfidence(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

export class LandmarkSmoother {
  private alpha: number;
  private previous: SmoothedState[] | null = null;
  private lastTimestampMs: number | null = null;

  constructor(config: SmoothingConfig = {}) {
    this.alpha = clampSmoothingAlpha(config.alpha ?? DEFAULT_SMOOTHING_ALPHA);
  }

  /**
   * Smooth one frame of raw MediaPipe landmarks. Returns the
   * per-landmark smoothed + raw values when MediaPipe produced a full
   * 33-landmark set; resets internal state and returns `null` for any
   * no-pose / partial-pose case so the next detected frame starts
   * fresh without bleeding stale coordinates forward.
   */
  smooth(
    landmarks: PoseLandmarks,
    timestampMs: number,
  ): ReadonlyArray<ProcessedPoseLandmark> | null {
    if (landmarks.length !== POSE_LANDMARK_COUNT) {
      this.reset();
      return null;
    }

    const isFirstFrame = this.previous === null;
    const previous = this.previous;
    const next: SmoothedState[] = new Array(POSE_LANDMARK_COUNT);
    const output: ProcessedPoseLandmark[] = new Array(POSE_LANDMARK_COUNT);

    for (let index = 0; index < POSE_LANDMARK_COUNT; index += 1) {
      const raw = landmarks[index];
      const rawX = safeCoordinate(raw.x, previous?.[index]?.x ?? 0);
      const rawY = safeCoordinate(raw.y, previous?.[index]?.y ?? 0);
      const rawZ = safeCoordinate(raw.z, previous?.[index]?.z ?? 0);
      const visibility = safeConfidence(raw.visibility);
      const presence = safeConfidence(raw.presence);

      let smoothedX: number;
      let smoothedY: number;
      let smoothedZ: number;

      if (isFirstFrame || previous === null) {
        smoothedX = rawX;
        smoothedY = rawY;
        smoothedZ = rawZ;
      } else {
        const prior = previous[index];
        const oneMinusAlpha = 1 - this.alpha;
        smoothedX = this.alpha * rawX + oneMinusAlpha * prior.x;
        smoothedY = this.alpha * rawY + oneMinusAlpha * prior.y;
        smoothedZ = this.alpha * rawZ + oneMinusAlpha * prior.z;
      }

      next[index] = { x: smoothedX, y: smoothedY, z: smoothedZ };
      // `isVisible` is filled in by the confidence filter later; the
      // smoother is honest about not knowing yet.
      output[index] = {
        x: smoothedX,
        y: smoothedY,
        z: smoothedZ,
        visibility,
        presence,
        isVisible: false,
        rawX,
        rawY,
        rawZ,
        smoothedX,
        smoothedY,
        smoothedZ,
      };
    }

    this.previous = next;
    this.lastTimestampMs = timestampMs;
    return output;
  }

  /**
   * Drop the previous-frame state. Callers MUST invoke this on
   * no-pose, inference stop, camera stop, model restart, and unmount
   * so the next smoothed frame does not blend with stale history.
   */
  reset(): void {
    this.previous = null;
    this.lastTimestampMs = null;
  }

  /** Update the EMA alpha at runtime. Clamped into `[0, 1]`. */
  setAlpha(alpha: number): void {
    this.alpha = clampSmoothingAlpha(alpha);
  }

  /** Current EMA alpha. Useful for the Phase 18 debug surface. */
  getAlpha(): number {
    return this.alpha;
  }

  /** Whether the smoother has at least one previous frame to blend with. */
  hasPrevious(): boolean {
    return this.previous !== null;
  }

  /** Timestamp of the last smoothed frame, or `null` if reset. */
  getLastTimestampMs(): number | null {
    return this.lastTimestampMs;
  }
}
