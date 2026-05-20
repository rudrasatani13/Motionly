/**
 * Phase 18 — Torso-scale landmark normalizer.
 *
 * Centers smoothed landmarks on the hip midpoint and divides by the
 * hip-to-shoulder distance ("torso scale") so downstream phases can
 * compare poses across users of different heights and camera framings
 * without leaking pixel-space assumptions everywhere.
 *
 * Important rules this file enforces:
 *
 * - **Fail safe, never invent.** If MediaPipe did not return the four
 *   torso landmarks (left/right hip, left/right shoulder), if the
 *   landmarks did not clear the Phase 18 visibility threshold, or if
 *   the resulting torso scale is too small / non-finite, normalization
 *   returns a `normalized: false` metadata block. The smoothed
 *   landmarks remain available; the normalized array becomes `null`
 *   for that frame.
 * - **No joint angles, no trunk angle, no symmetry math.** Those
 *   belong to Phase 19+.
 * - **Pure function over inputs.** The normalizer is stateless. It
 *   only reads the smoothed landmark array plus its config.
 */

import { POSE_LANDMARK } from '@ml/pose/landmark-names';
import { DEFAULT_NORMALIZATION_MIN_TORSO_SCALE } from '@ml/pose/pose-processing-config';
import type {
  NormalizedPoseLandmark,
  NormalizedPoseLandmarks,
  PoseNormalizationFailureReason,
  PoseNormalizationMetadata,
  ProcessedPoseLandmarks,
} from '@/types/pose';

export type LandmarkNormalizerConfig = {
  minTorsoScale?: number;
};

export type LandmarkNormalizationResult = {
  landmarks: NormalizedPoseLandmarks | null;
  metadata: PoseNormalizationMetadata;
};

type Vec3 = { x: number; y: number; z: number };

function midpoint(a: Vec3, b: Vec3): Vec3 {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
  };
}

function distance(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function failure(reason: PoseNormalizationFailureReason): LandmarkNormalizationResult {
  return {
    landmarks: null,
    metadata: { normalized: false, reason },
  };
}

export class LandmarkNormalizer {
  private minTorsoScale: number;

  constructor(config: LandmarkNormalizerConfig = {}) {
    const provided = config.minTorsoScale;
    this.minTorsoScale =
      typeof provided === 'number' && Number.isFinite(provided) && provided > 0
        ? provided
        : DEFAULT_NORMALIZATION_MIN_TORSO_SCALE;
  }

  setMinTorsoScale(value: number): void {
    if (Number.isFinite(value) && value > 0) {
      this.minTorsoScale = value;
    }
  }

  getMinTorsoScale(): number {
    return this.minTorsoScale;
  }

  /**
   * Normalize one frame of smoothed landmarks. Returns the normalized
   * array + metadata on success, or `null` landmarks + a tagged
   * failure reason when the torso reference is not available.
   */
  normalize(landmarks: ProcessedPoseLandmarks): LandmarkNormalizationResult {
    if (landmarks.length === 0) {
      return failure('no-landmarks');
    }

    const leftHip = landmarks[POSE_LANDMARK.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARK.RIGHT_HIP];
    const leftShoulder = landmarks[POSE_LANDMARK.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARK.RIGHT_SHOULDER];

    if (
      leftHip === undefined ||
      rightHip === undefined ||
      leftShoulder === undefined ||
      rightShoulder === undefined
    ) {
      return failure('no-landmarks');
    }

    if (
      !leftHip.isVisible ||
      !rightHip.isVisible ||
      !leftShoulder.isVisible ||
      !rightShoulder.isVisible
    ) {
      return failure('key-landmarks-occluded');
    }

    const hipCenter = midpoint(leftHip, rightHip);
    const shoulderCenter = midpoint(leftShoulder, rightShoulder);
    const torsoScale = distance(hipCenter, shoulderCenter);

    if (!Number.isFinite(torsoScale)) {
      return failure('numeric-instability');
    }
    if (torsoScale < this.minTorsoScale) {
      return failure('invalid-torso-scale');
    }

    const normalized: NormalizedPoseLandmark[] = new Array(landmarks.length);
    for (let index = 0; index < landmarks.length; index += 1) {
      const lm = landmarks[index];
      const nx = (lm.x - hipCenter.x) / torsoScale;
      const ny = (lm.y - hipCenter.y) / torsoScale;
      const nz = (lm.z - hipCenter.z) / torsoScale;
      if (!Number.isFinite(nx) || !Number.isFinite(ny) || !Number.isFinite(nz)) {
        return failure('numeric-instability');
      }
      normalized[index] = {
        normalizedX: nx,
        normalizedY: ny,
        normalizedZ: nz,
        isVisible: lm.isVisible,
        visibility: lm.visibility,
        presence: lm.presence,
      };
    }

    return {
      landmarks: normalized,
      metadata: {
        normalized: true,
        torsoScale,
        hipCenter,
        shoulderCenter,
      },
    };
  }
}
