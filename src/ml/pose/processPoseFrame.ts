/**
 * Phase 18 — Frame processor.
 *
 * Glues the EMA smoother, the confidence filter, and the torso-scale
 * normalizer into a single deterministic per-frame pipeline:
 *
 *   raw PoseFrame
 *     → confidence filter (build visibility report on raw landmarks)
 *     → smoother (per-axis EMA)
 *     → confidence filter (tag the smoothed landmarks)
 *     → normalizer (torso-scale, hip-mid origin)
 *     → ProcessedPoseFrame
 *
 * Important rules this file enforces:
 *
 * - **One owner per inference session.** The processor holds the
 *   smoother's previous-frame state; the hook creates a fresh
 *   `PoseFrameProcessor` per `start()` and calls `reset()` on stop /
 *   unmount / no-pose / model restart so the EMA never blends across
 *   sessions.
 * - **No fabrication on a no-pose frame.** When MediaPipe returned no
 *   landmarks the processor resets the smoother, increments a dropped
 *   counter for the debug surface, and returns `processed: null`.
 * - **Visibility is honest.** The processed landmarks carry the
 *   filter's tag verbatim; partial frames still emit a processed
 *   result, they just won't normalize.
 * - **Side effects are timing measurements only.** The processor
 *   touches `performance.now()` to populate `PoseProcessingStats`. It
 *   never logs per-frame, never writes to storage, never emits events.
 */

import { ConfidenceFilter } from '@ml/pose/ConfidenceFilter';
import { LandmarkNormalizer } from '@ml/pose/LandmarkNormalizer';
import { LandmarkSmoother } from '@ml/pose/LandmarkSmoother';
import { POSE_LANDMARK_COUNT } from '@ml/pose/landmark-names';
import {
  DEFAULT_POSE_PROCESSING_CONFIG,
  resolvePoseProcessingConfig,
} from '@ml/pose/pose-processing-config';
import type {
  BodyVisibilityStatus,
  PoseFrame,
  PoseProcessingConfig,
  PoseProcessingResult,
  PoseProcessingStats,
  ProcessedPoseFrame,
  ProcessedPoseLandmark,
} from '@/types/pose';

export type PoseFrameProcessorConfig = Partial<PoseProcessingConfig>;

function emptyStats(): PoseProcessingStats {
  return {
    smoothingMs: 0,
    filteringMs: 0,
    normalizationMs: 0,
    totalProcessingMs: 0,
    processedFrames: 0,
    droppedFrames: 0,
  };
}

function bodyStatusFromReport(
  hasLandmarks: boolean,
  isBodyFullyVisible: boolean,
): BodyVisibilityStatus {
  if (!hasLandmarks) {
    return 'no-pose';
  }
  return isBodyFullyVisible ? 'fully-visible' : 'partial';
}

export class PoseFrameProcessor {
  private config: PoseProcessingConfig;
  private smoother: LandmarkSmoother;
  private filter: ConfidenceFilter;
  private normalizer: LandmarkNormalizer;
  private processedFrames = 0;
  private droppedFrames = 0;

  constructor(overrides?: PoseFrameProcessorConfig) {
    this.config = resolvePoseProcessingConfig(overrides);
    this.smoother = new LandmarkSmoother({ alpha: this.config.smoothingAlpha });
    this.filter = new ConfidenceFilter({
      landmarkVisibilityThreshold: this.config.landmarkVisibilityThreshold,
      bodyVisibilityThreshold: this.config.bodyVisibilityThreshold,
    });
    this.normalizer = new LandmarkNormalizer({
      minTorsoScale: this.config.normalizationMinTorsoScale,
    });
  }

  /**
   * Process one raw frame. Returns the raw frame plus a
   * `ProcessedPoseFrame` (or `null` when no pose was detected).
   */
  process(frame: PoseFrame): PoseProcessingResult {
    const start = performance.now();

    if (frame.landmarks.length !== POSE_LANDMARK_COUNT) {
      this.smoother.reset();
      this.droppedFrames += 1;
      return { raw: frame, processed: null };
    }

    const filterStart = performance.now();
    const rawVisibility = this.filter.buildVisibilityReport(frame.landmarks);
    const filterRawMs = performance.now() - filterStart;

    const smoothStart = performance.now();
    const smoothed = this.smoother.smooth(frame.landmarks, frame.timestampMs);
    const smoothingMs = performance.now() - smoothStart;

    if (smoothed === null) {
      this.droppedFrames += 1;
      return { raw: frame, processed: null };
    }

    // Re-tag each smoothed landmark with the per-landmark filter so
    // downstream code (and the normalizer) sees the same isVisible
    // signal as the visibility report.
    const filterSmoothStart = performance.now();
    const tagged: ProcessedPoseLandmark[] = new Array(smoothed.length);
    for (let index = 0; index < smoothed.length; index += 1) {
      const lm = smoothed[index];
      const rawLm = frame.landmarks[index];
      const tag = rawLm === undefined ? { isVisible: false } : this.filter.tagLandmark(rawLm);
      tagged[index] = { ...lm, isVisible: tag.isVisible };
    }
    const filterSmoothMs = performance.now() - filterSmoothStart;

    const normalizeStart = performance.now();
    const normalizationResult = this.normalizer.normalize(tagged);
    const normalizationMs = performance.now() - normalizeStart;

    this.processedFrames += 1;
    const totalProcessingMs = performance.now() - start;

    const processed: ProcessedPoseFrame = {
      frameId: frame.frameId,
      timestampMs: frame.timestampMs,
      smoothedLandmarks: tagged,
      normalizedLandmarks: normalizationResult.landmarks,
      normalization: normalizationResult.metadata,
      visibility: rawVisibility,
      bodyVisibilityStatus: bodyStatusFromReport(true, rawVisibility.isBodyFullyVisible),
      stats: {
        smoothingMs,
        filteringMs: filterRawMs + filterSmoothMs,
        normalizationMs,
        totalProcessingMs,
        processedFrames: this.processedFrames,
        droppedFrames: this.droppedFrames,
      },
    };

    return { raw: frame, processed };
  }

  /** Reset all internal state — smoother history and frame counters. */
  reset(): void {
    this.smoother.reset();
    this.processedFrames = 0;
    this.droppedFrames = 0;
  }

  /** Read-only view of the current config. */
  getConfig(): PoseProcessingConfig {
    return { ...this.config };
  }

  /**
   * Merge new overrides into the active config. Resets the smoother
   * because alpha changes mean the existing history is no longer
   * comparable to incoming frames.
   */
  updateConfig(overrides: PoseFrameProcessorConfig): void {
    this.config = resolvePoseProcessingConfig({ ...this.config, ...overrides });
    this.smoother.setAlpha(this.config.smoothingAlpha);
    this.smoother.reset();
    this.filter.setLandmarkVisibilityThreshold(this.config.landmarkVisibilityThreshold);
    this.filter.setBodyVisibilityThreshold(this.config.bodyVisibilityThreshold);
    this.normalizer.setMinTorsoScale(this.config.normalizationMinTorsoScale);
  }

  getProcessedFrameCount(): number {
    return this.processedFrames;
  }

  getDroppedFrameCount(): number {
    return this.droppedFrames;
  }
}

/**
 * Functional convenience wrapper for callers that want to use the
 * Phase 18 pipeline without holding the processor instance themselves.
 *
 * IMPORTANT: Because the smoother is stateful, callers MUST pass the
 * same `processor` instance across frames. Creating a new processor
 * per frame disables smoothing entirely.
 */
export function processPoseFrame(
  processor: PoseFrameProcessor,
  frame: PoseFrame,
): PoseProcessingResult {
  return processor.process(frame);
}

/** Convenience export so the hook can default-instantiate cleanly. */
export const DEFAULT_PROCESSOR_CONFIG: PoseProcessingConfig = {
  ...DEFAULT_POSE_PROCESSING_CONFIG,
};

/** Empty processing stats — used to clear the store on stop/reset. */
export const EMPTY_PROCESSING_STATS: PoseProcessingStats = emptyStats();
