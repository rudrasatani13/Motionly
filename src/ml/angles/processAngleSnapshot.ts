/**
 * Phase 19 — Per-frame angle snapshot processor.
 *
 * Consumes a Phase 18 `ProcessedPoseFrame` and produces an
 * `AngleCalculationResult` containing:
 *
 * - An `AngleSnapshot` with every named joint angle / metric for the
 *   frame (each tagged with its own availability status), or `null`
 *   when the processed frame was missing.
 * - Per-frame calculation overhead stats (`performance.now()`-based,
 *   never averaged here).
 *
 * The processor also owns an `AngleHistory` ring buffer. New snapshots
 * are pushed automatically on each successful `process()`; the history
 * is cleared on `reset()` so a no-pose frame, model restart, or
 * inference stop never leaves stale data behind.
 *
 * Rules this file enforces:
 *
 * - **No fabrication.** When `processedFrame` is `null`, the processor
 *   clears its history and returns `snapshot: null`. The hook reflects
 *   this in the store, so the UI shows "unavailable" with a reason
 *   instead of stale numbers.
 * - **No coaching.** Snapshots are raw geometric measurements; no
 *   threshold checks, no rep state, no cues.
 * - **No persistence.** History lives in memory; cleared on reset.
 * - **No logging.** Per-frame logging would drown DevTools at 30 FPS.
 */

import { AngleHistory } from '@ml/angles/AngleHistory';
import {
  ankleAngle,
  elbowAngle,
  hipAngle,
  hipSymmetry,
  kneeAngle,
  kneeValgus,
  shoulderAngle,
  trunkAngle,
} from '@ml/angles/JointAngles';
import { DEFAULT_ANGLE_HISTORY_CAPACITY } from '@ml/angles/angle-config';
import type {
  AngleAvailabilityReport,
  AngleCalculationResult,
  AngleCalculationStats,
  AngleMetricName,
  AngleMetricValue,
  AngleSnapshot,
  AngleValue,
  JointAngleName,
} from '@/types/angles';
import type { ProcessedPoseFrame } from '@/types/pose';

export type AngleFrameProcessorConfig = {
  historyCapacity?: number;
};

function emptyStats(history: AngleHistory): AngleCalculationStats {
  return {
    totalCalculationMs: 0,
    snapshotsProduced: 0,
    framesSkipped: 0,
    historySize: history.size(),
    historyCapacity: history.capacity(),
  };
}

function buildAvailability(
  snapshot: Omit<AngleSnapshot, 'availability'>,
  normalizationAvailable: boolean,
): AngleAvailabilityReport {
  const angleEntries: Array<[JointAngleName, AngleValue]> = [
    ['leftKnee', snapshot.leftKnee],
    ['rightKnee', snapshot.rightKnee],
    ['leftHip', snapshot.leftHip],
    ['rightHip', snapshot.rightHip],
    ['leftAnkle', snapshot.leftAnkle],
    ['rightAnkle', snapshot.rightAnkle],
    ['leftElbow', snapshot.leftElbow],
    ['rightElbow', snapshot.rightElbow],
    ['leftShoulder', snapshot.leftShoulder],
    ['rightShoulder', snapshot.rightShoulder],
    ['trunk', snapshot.trunkAngle],
  ];

  const metricEntries: Array<[AngleMetricName, AngleMetricValue]> = [
    ['leftKneeValgus', snapshot.leftKneeValgusRatio],
    ['rightKneeValgus', snapshot.rightKneeValgusRatio],
    ['hipSymmetry', snapshot.hipSymmetryDelta],
  ];

  const unavailableAngles: JointAngleName[] = [];
  let availableAngleCount = 0;
  for (const [name, value] of angleEntries) {
    if (value.status === 'available') {
      availableAngleCount += 1;
    } else {
      unavailableAngles.push(name);
    }
  }

  const unavailableMetrics: AngleMetricName[] = [];
  let availableMetricCount = 0;
  for (const [name, value] of metricEntries) {
    if (value.status === 'available') {
      availableMetricCount += 1;
    } else {
      unavailableMetrics.push(name);
    }
  }

  return {
    availableAngleCount,
    unavailableAngleCount: angleEntries.length - availableAngleCount,
    availableMetricCount,
    unavailableMetricCount: metricEntries.length - availableMetricCount,
    unavailableAngles,
    unavailableMetrics,
    normalizationAvailable,
  };
}

export class AngleFrameProcessor {
  private readonly history: AngleHistory;
  private snapshotsProduced = 0;
  private framesSkipped = 0;
  private lastCalculationMs = 0;

  constructor(config: AngleFrameProcessorConfig = {}) {
    this.history = new AngleHistory({
      capacity: config.historyCapacity ?? DEFAULT_ANGLE_HISTORY_CAPACITY,
    });
  }

  /**
   * Compute every named joint angle / metric for the given processed
   * frame and append the snapshot to the bounded history.
   *
   * Returns `snapshot: null` when no processed frame was available
   * (Phase 18 returned `null`); the caller should clear any stored
   * snapshot in the same tick so the UI never displays stale data.
   */
  process(processedFrame: ProcessedPoseFrame | null): AngleCalculationResult {
    if (processedFrame === null) {
      this.framesSkipped += 1;
      this.lastCalculationMs = 0;
      this.history.clear();
      return {
        snapshot: null,
        stats: {
          totalCalculationMs: 0,
          snapshotsProduced: this.snapshotsProduced,
          framesSkipped: this.framesSkipped,
          historySize: this.history.size(),
          historyCapacity: this.history.capacity(),
        },
      };
    }

    const start =
      typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();

    const smoothed = processedFrame.smoothedLandmarks;
    const normalized = processedFrame.normalizedLandmarks;
    const normalizationAvailable = processedFrame.normalization.normalized === true;

    const partial: Omit<AngleSnapshot, 'availability'> = {
      frameId: processedFrame.frameId,
      timestampMs: processedFrame.timestampMs,
      leftKnee: kneeAngle('left', smoothed),
      rightKnee: kneeAngle('right', smoothed),
      leftHip: hipAngle('left', smoothed),
      rightHip: hipAngle('right', smoothed),
      leftAnkle: ankleAngle('left', smoothed),
      rightAnkle: ankleAngle('right', smoothed),
      leftElbow: elbowAngle('left', smoothed),
      rightElbow: elbowAngle('right', smoothed),
      leftShoulder: shoulderAngle('left', smoothed),
      rightShoulder: shoulderAngle('right', smoothed),
      trunkAngle: trunkAngle(smoothed, normalized),
      leftKneeValgusRatio: kneeValgus('left', normalized),
      rightKneeValgusRatio: kneeValgus('right', normalized),
      hipSymmetryDelta: hipSymmetry(normalized),
    };

    const snapshot: AngleSnapshot = {
      ...partial,
      availability: buildAvailability(partial, normalizationAvailable),
    };

    this.history.push(snapshot);
    this.snapshotsProduced += 1;

    const end =
      typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
    this.lastCalculationMs = end - start;

    return {
      snapshot,
      stats: {
        totalCalculationMs: this.lastCalculationMs,
        snapshotsProduced: this.snapshotsProduced,
        framesSkipped: this.framesSkipped,
        historySize: this.history.size(),
        historyCapacity: this.history.capacity(),
      },
    };
  }

  /** Drop every stored snapshot and reset frame counters. */
  reset(): void {
    this.history.clear();
    this.snapshotsProduced = 0;
    this.framesSkipped = 0;
    this.lastCalculationMs = 0;
  }

  /** Direct access to the underlying history (read-only operations). */
  getHistory(): AngleHistory {
    return this.history;
  }

  /** Configured capacity of the history ring buffer. */
  getHistoryCapacity(): number {
    return this.history.capacity();
  }

  /** Current size of the history ring buffer (0..capacity). */
  getHistorySize(): number {
    return this.history.size();
  }

  /** Read-only stats view (mirrors what `process()` last returned). */
  getStats(): AngleCalculationStats {
    return {
      totalCalculationMs: this.lastCalculationMs,
      snapshotsProduced: this.snapshotsProduced,
      framesSkipped: this.framesSkipped,
      historySize: this.history.size(),
      historyCapacity: this.history.capacity(),
    };
  }
}

/**
 * Functional convenience wrapper for callers that prefer to hold the
 * processor instance themselves.
 *
 * IMPORTANT: Because the processor owns an `AngleHistory` ring buffer
 * and frame counters, callers MUST pass the same `processor` across
 * frames. Creating a new processor per frame defeats the history.
 */
export function processAngleSnapshot(
  processor: AngleFrameProcessor,
  processedFrame: ProcessedPoseFrame | null,
): AngleCalculationResult {
  return processor.process(processedFrame);
}

/** Empty stats helper for resetting the store on stop / unmount. */
export function emptyAngleStats(history?: AngleHistory): AngleCalculationStats {
  if (history !== undefined) {
    return emptyStats(history);
  }
  return {
    totalCalculationMs: 0,
    snapshotsProduced: 0,
    framesSkipped: 0,
    historySize: 0,
    historyCapacity: DEFAULT_ANGLE_HISTORY_CAPACITY,
  };
}
