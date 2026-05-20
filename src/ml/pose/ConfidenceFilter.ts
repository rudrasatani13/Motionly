/**
 * Phase 18 — Confidence / visibility filter for processed landmarks.
 *
 * Tags each landmark as visible or occluded using MediaPipe's
 * per-landmark `visibility` (and `presence` when meaningful), reports
 * which key body landmarks were occluded for the current frame, and
 * computes a single mean visibility score over the configured key
 * landmarks for the Phase 18 debug surface.
 *
 * Important rules this file enforces:
 *
 * - **No "form confidence", no readiness score, no medical claims.**
 *   The filter only restates what MediaPipe reported. It does not
 *   invent a 0–100 "AI accuracy" number or imply injury risk.
 * - **No fabrication.** A landmark is "visible" iff it cleared the
 *   real thresholds. If presence equals visibility (the Phase 17
 *   passthrough case) it's evaluated as one signal — `presenceUsed`
 *   in `PoseVisibilityTag` records that.
 * - **Honest "fully visible".** `isBodyFullyVisible` is `true` only
 *   when every configured key landmark cleared the threshold for the
 *   current frame; no partial frame is allowed to pass as fully
 *   visible just because the mean is high.
 * - **Does not block inference.** The Phase 18 pipeline still emits
 *   the processed frame for partially-occluded poses; this module
 *   only tags the data so the UI and later phases can react.
 */

import { POSE_LANDMARK_NAMES } from '@ml/pose/landmark-names';
import {
  DEFAULT_BODY_VISIBILITY_THRESHOLD,
  DEFAULT_LANDMARK_VISIBILITY_THRESHOLD,
  POSE_BODY_VISIBILITY_LANDMARK_NAMES,
  POSE_BODY_VISIBILITY_LANDMARKS,
  clampVisibilityThreshold,
} from '@ml/pose/pose-processing-config';
import type {
  PoseKeyLandmarkVisibility,
  PoseLandmark,
  PoseLandmarks,
  PoseVisibilityReport,
  PoseVisibilityTag,
} from '@/types/pose';

export type ConfidenceFilterConfig = {
  landmarkVisibilityThreshold?: number;
  bodyVisibilityThreshold?: number;
};

function clamp01(value: number): number {
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

function presenceProvidesNewSignal(landmark: PoseLandmark): boolean {
  // Phase 17 mirrors MediaPipe's `visibility` into `presence` because
  // Tasks-Vision does not yet expose a separate presence channel. When
  // the two are exactly equal we treat them as one signal so the
  // filter does not "double count" the same number.
  return landmark.presence !== landmark.visibility;
}

export class ConfidenceFilter {
  private landmarkThreshold: number;
  private bodyThreshold: number;

  constructor(config: ConfidenceFilterConfig = {}) {
    this.landmarkThreshold = clampVisibilityThreshold(
      config.landmarkVisibilityThreshold ?? DEFAULT_LANDMARK_VISIBILITY_THRESHOLD,
      DEFAULT_LANDMARK_VISIBILITY_THRESHOLD,
    );
    this.bodyThreshold = clampVisibilityThreshold(
      config.bodyVisibilityThreshold ?? DEFAULT_BODY_VISIBILITY_THRESHOLD,
      DEFAULT_BODY_VISIBILITY_THRESHOLD,
    );
  }

  setLandmarkVisibilityThreshold(threshold: number): void {
    this.landmarkThreshold = clampVisibilityThreshold(
      threshold,
      DEFAULT_LANDMARK_VISIBILITY_THRESHOLD,
    );
  }

  setBodyVisibilityThreshold(threshold: number): void {
    this.bodyThreshold = clampVisibilityThreshold(threshold, DEFAULT_BODY_VISIBILITY_THRESHOLD);
  }

  getLandmarkVisibilityThreshold(): number {
    return this.landmarkThreshold;
  }

  getBodyVisibilityThreshold(): number {
    return this.bodyThreshold;
  }

  /** Evaluate one landmark against the configured threshold. */
  tagLandmark(landmark: PoseLandmark): PoseVisibilityTag {
    const visibility = clamp01(landmark.visibility);
    const presence = clamp01(landmark.presence);
    const presenceUsed = presenceProvidesNewSignal(landmark);

    const visibilityPasses = visibility >= this.landmarkThreshold;
    const presencePasses = presenceUsed ? presence >= this.landmarkThreshold : true;

    return {
      isVisible: visibilityPasses && presencePasses,
      visibility,
      presence,
      presenceUsed,
    };
  }

  /** Convenience boolean — `true` only when every key landmark passes. */
  isBodyFullyVisible(landmarks: PoseLandmarks): boolean {
    if (landmarks.length === 0) {
      return false;
    }
    for (let i = 0; i < POSE_BODY_VISIBILITY_LANDMARKS.length; i += 1) {
      const index = POSE_BODY_VISIBILITY_LANDMARKS[i];
      const landmark = landmarks[index];
      if (landmark === undefined) {
        return false;
      }
      if (!this.tagLandmark(landmark).isVisible) {
        return false;
      }
    }
    return true;
  }

  /** Names of landmarks across all 33 that did not clear the threshold. */
  getOccludedLandmarks(landmarks: PoseLandmarks): ReadonlyArray<string> {
    if (landmarks.length === 0) {
      return [];
    }
    const occluded: string[] = [];
    for (let index = 0; index < landmarks.length; index += 1) {
      const landmark = landmarks[index];
      if (landmark === undefined) {
        continue;
      }
      if (!this.tagLandmark(landmark).isVisible) {
        const name = POSE_LANDMARK_NAMES[index];
        if (name !== undefined) {
          occluded.push(name);
        }
      }
    }
    return occluded;
  }

  /**
   * Build the full Phase 18 visibility report for one frame. Empty
   * input returns an honest zero-state report; never invents numbers.
   */
  buildVisibilityReport(landmarks: PoseLandmarks): PoseVisibilityReport {
    if (landmarks.length === 0) {
      return {
        bodyVisibilityScore: 0,
        isBodyFullyVisible: false,
        visibleLandmarkCount: 0,
        evaluatedLandmarkCount: 0,
        occludedKeyLandmarks: [],
        occludedLandmarks: [],
        keyLandmarkVisibility: [],
      };
    }

    let visibleLandmarkCount = 0;
    const occludedLandmarks: string[] = [];

    for (let index = 0; index < landmarks.length; index += 1) {
      const landmark = landmarks[index];
      if (landmark === undefined) {
        continue;
      }
      const tag = this.tagLandmark(landmark);
      if (tag.isVisible) {
        visibleLandmarkCount += 1;
      } else {
        const name = POSE_LANDMARK_NAMES[index];
        if (name !== undefined) {
          occludedLandmarks.push(name);
        }
      }
    }

    let keySum = 0;
    let keyEvaluated = 0;
    let allKeyVisible = true;
    const occludedKeyLandmarks: string[] = [];
    const keyLandmarkVisibility: PoseKeyLandmarkVisibility[] = [];

    for (let i = 0; i < POSE_BODY_VISIBILITY_LANDMARKS.length; i += 1) {
      const landmarkIndex = POSE_BODY_VISIBILITY_LANDMARKS[i];
      const landmark = landmarks[landmarkIndex];
      const name = POSE_BODY_VISIBILITY_LANDMARK_NAMES[i] ?? `LANDMARK_${landmarkIndex}`;
      if (landmark === undefined) {
        allKeyVisible = false;
        occludedKeyLandmarks.push(name);
        keyLandmarkVisibility.push({
          name,
          visibility: 0,
          presence: 0,
          isVisible: false,
        });
        continue;
      }
      const tag = this.tagLandmark(landmark);
      keySum += tag.visibility;
      keyEvaluated += 1;
      if (!tag.isVisible) {
        allKeyVisible = false;
        occludedKeyLandmarks.push(name);
      }
      keyLandmarkVisibility.push({
        name,
        visibility: tag.visibility,
        presence: tag.presence,
        isVisible: tag.isVisible,
      });
    }

    const bodyVisibilityScore = keyEvaluated > 0 ? keySum / keyEvaluated : 0;
    const isBodyFullyVisible = allKeyVisible && bodyVisibilityScore >= this.bodyThreshold;

    return {
      bodyVisibilityScore,
      isBodyFullyVisible,
      visibleLandmarkCount,
      evaluatedLandmarkCount: landmarks.length,
      occludedKeyLandmarks,
      occludedLandmarks,
      keyLandmarkVisibility,
    };
  }
}
