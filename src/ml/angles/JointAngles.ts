/**
 * Phase 19 — Named joint angle / metric helpers.
 *
 * Consumes a Phase 18 `ProcessedPoseFrame` and returns typed
 * `AngleValue` / `AngleMetricValue` results for the named joints and
 * geometry-derived metrics Motionly tracks:
 *
 * - True vector joint angles (degrees in `[0, 180]`):
 *   - `kneeAngle(side)`   — hip → knee → ankle
 *   - `hipAngle(side)`    — shoulder → hip → knee
 *   - `ankleAngle(side)`  — knee → ankle → foot_index
 *   - `elbowAngle(side)`  — shoulder → elbow → wrist
 *   - `shoulderAngle(side)` — hip → shoulder → elbow
 *   - `trunkAngle()`      — vertical deviation of the shoulder-midpoint
 *     to hip-midpoint vector. `0°` means upright relative to the
 *     screen-vertical axis in normalized pose space.
 *
 * - Geometry-derived metrics (normalized ratios, NOT degrees):
 *   - `kneeValgus(side)`  — knee lateral deviation from the
 *     hip → ankle line, divided by the hip → ankle length. Returns a
 *     unit-less ratio; positive values mean the knee deviates toward
 *     the body midline (cave-in / valgus), negative toward the
 *     outside.
 *   - `hipSymmetry()`     — left-vs-right hip vertical height
 *     difference, normalized by the hip-to-hip width. Positive values
 *     mean the right hip is higher than the left in image space.
 *
 * Rules this file enforces:
 *
 * - **Prefer normalized landmarks when available.** Knee valgus and
 *   hip symmetry are *only* defined in torso-scale-normalized space
 *   because raw image-space pixels carry framing-dependent scale.
 *   Vector joint angles can also be computed safely on smoothed
 *   landmarks (they are scale-invariant), and we fall back to that
 *   space when normalization is unavailable — the returned `AngleValue`
 *   marks `sourceSpace: 'smoothed'` so the debug UI stays honest.
 * - **Honor Phase 18 visibility tags.** Any required landmark whose
 *   `isVisible` flag is `false` short-circuits to
 *   `key-landmarks-occluded`. We never reach into the math with an
 *   occluded landmark.
 * - **Never invent values.** Missing landmarks → typed unavailable.
 *   `null` / `NaN` / `Infinity` are never returned to UI.
 * - **No thresholds, no classification.** This file decides what an
 *   angle IS, not whether it is "good", "deep enough", or "valgus".
 *   Form rules and cues live in Phase 21+.
 */

import { angleFromVertical2D, calculateAngle, vectorLength2D } from '@ml/angles/AngleCalculator';
import { POSE_LANDMARK } from '@ml/pose/landmark-names';
import type { PoseLandmarkIndex, PoseLandmarkName } from '@ml/pose/landmark-names';
import type {
  AngleAvailabilityStatus,
  AngleMetricValue,
  AngleSide,
  AngleSourceSpace,
  AngleValue,
} from '@/types/angles';
import type {
  NormalizedPoseLandmark,
  NormalizedPoseLandmarks,
  ProcessedPoseLandmark,
  ProcessedPoseLandmarks,
} from '@/types/pose';

const LANDMARK_NAME_BY_INDEX: ReadonlyArray<PoseLandmarkName> = (
  Object.entries(POSE_LANDMARK) as Array<[PoseLandmarkName, number]>
)
  .sort(([, a], [, b]) => a - b)
  .map(([name]) => name);

function nameOf(index: PoseLandmarkIndex): string {
  const name = LANDMARK_NAME_BY_INDEX[index];
  return name ?? `INDEX_${index}`;
}

type PlanarPoint = { x: number; y: number };

type PlanarSample = {
  point: PlanarPoint;
  isVisible: boolean;
  visibility: number;
};

function sampleSmoothed(
  landmarks: ProcessedPoseLandmarks,
  index: PoseLandmarkIndex,
): PlanarSample | undefined {
  const lm: ProcessedPoseLandmark | undefined = landmarks[index];
  if (lm === undefined) {
    return undefined;
  }
  return {
    point: { x: lm.x, y: lm.y },
    isVisible: lm.isVisible,
    visibility: lm.visibility,
  };
}

function sampleNormalized(
  landmarks: NormalizedPoseLandmarks,
  index: PoseLandmarkIndex,
): PlanarSample | undefined {
  const lm: NormalizedPoseLandmark | undefined = landmarks[index];
  if (lm === undefined) {
    return undefined;
  }
  return {
    point: { x: lm.normalizedX, y: lm.normalizedY },
    isVisible: lm.isVisible,
    visibility: lm.visibility,
  };
}

function meanVisibility(samples: ReadonlyArray<PlanarSample>): number {
  if (samples.length === 0) {
    return 0;
  }
  let total = 0;
  for (const sample of samples) {
    total += sample.visibility;
  }
  return total / samples.length;
}

function unavailableAngle(
  reason: Exclude<AngleAvailabilityStatus, 'available'>,
  usedLandmarks: ReadonlyArray<string>,
  sourceSpace: AngleSourceSpace,
  message?: string,
): AngleValue {
  return {
    valueDegrees: null,
    status: reason,
    unit: 'degrees',
    usedLandmarks,
    visibility: 0,
    sourceSpace,
    reason: message,
  };
}

function unavailableMetric(
  reason: Exclude<AngleAvailabilityStatus, 'available'>,
  usedLandmarks: ReadonlyArray<string>,
  sourceSpace: AngleSourceSpace,
  message?: string,
): AngleMetricValue {
  return {
    value: null,
    status: reason,
    unit: 'ratio',
    usedLandmarks,
    visibility: 0,
    sourceSpace,
    reason: message,
  };
}

/**
 * Compute a three-point vector joint angle in degrees `[0, 180]` from
 * the Phase 18 smoothed landmarks. Returns an `AngleValue` carrying
 * the status, used-landmark names, and mean visibility of the inputs.
 *
 * Smoothed image-space coordinates are scale-invariant for true vector
 * angles, so this helper does not require normalization.
 */
function computeJointAngle(
  smoothed: ProcessedPoseLandmarks,
  aIndex: PoseLandmarkIndex,
  vertexIndex: PoseLandmarkIndex,
  cIndex: PoseLandmarkIndex,
): AngleValue {
  const usedLandmarks: ReadonlyArray<string> = [
    nameOf(aIndex),
    nameOf(vertexIndex),
    nameOf(cIndex),
  ];

  const aSample = sampleSmoothed(smoothed, aIndex);
  const vertexSample = sampleSmoothed(smoothed, vertexIndex);
  const cSample = sampleSmoothed(smoothed, cIndex);

  if (aSample === undefined || vertexSample === undefined || cSample === undefined) {
    return unavailableAngle('key-landmarks-missing', usedLandmarks, 'smoothed');
  }

  if (!aSample.isVisible || !vertexSample.isVisible || !cSample.isVisible) {
    return {
      ...unavailableAngle('key-landmarks-occluded', usedLandmarks, 'smoothed'),
      visibility: meanVisibility([aSample, vertexSample, cSample]),
    };
  }

  const math = calculateAngle(aSample.point, vertexSample.point, cSample.point);
  if (math.status !== 'available' || math.valueDegrees === null) {
    const reason = math.status === 'available' ? 'numeric-instability' : math.status;
    return {
      ...unavailableAngle(reason, usedLandmarks, 'smoothed'),
      visibility: meanVisibility([aSample, vertexSample, cSample]),
    };
  }

  return {
    valueDegrees: math.valueDegrees,
    status: 'available',
    unit: 'degrees',
    usedLandmarks,
    visibility: meanVisibility([aSample, vertexSample, cSample]),
    sourceSpace: 'smoothed',
  };
}

const KNEE_INDICES: Record<
  AngleSide,
  { hip: PoseLandmarkIndex; knee: PoseLandmarkIndex; ankle: PoseLandmarkIndex }
> = {
  left: {
    hip: POSE_LANDMARK.LEFT_HIP,
    knee: POSE_LANDMARK.LEFT_KNEE,
    ankle: POSE_LANDMARK.LEFT_ANKLE,
  },
  right: {
    hip: POSE_LANDMARK.RIGHT_HIP,
    knee: POSE_LANDMARK.RIGHT_KNEE,
    ankle: POSE_LANDMARK.RIGHT_ANKLE,
  },
};

const HIP_INDICES: Record<
  AngleSide,
  { shoulder: PoseLandmarkIndex; hip: PoseLandmarkIndex; knee: PoseLandmarkIndex }
> = {
  left: {
    shoulder: POSE_LANDMARK.LEFT_SHOULDER,
    hip: POSE_LANDMARK.LEFT_HIP,
    knee: POSE_LANDMARK.LEFT_KNEE,
  },
  right: {
    shoulder: POSE_LANDMARK.RIGHT_SHOULDER,
    hip: POSE_LANDMARK.RIGHT_HIP,
    knee: POSE_LANDMARK.RIGHT_KNEE,
  },
};

const ANKLE_INDICES: Record<
  AngleSide,
  { knee: PoseLandmarkIndex; ankle: PoseLandmarkIndex; footIndex: PoseLandmarkIndex }
> = {
  left: {
    knee: POSE_LANDMARK.LEFT_KNEE,
    ankle: POSE_LANDMARK.LEFT_ANKLE,
    footIndex: POSE_LANDMARK.LEFT_FOOT_INDEX,
  },
  right: {
    knee: POSE_LANDMARK.RIGHT_KNEE,
    ankle: POSE_LANDMARK.RIGHT_ANKLE,
    footIndex: POSE_LANDMARK.RIGHT_FOOT_INDEX,
  },
};

const ELBOW_INDICES: Record<
  AngleSide,
  { shoulder: PoseLandmarkIndex; elbow: PoseLandmarkIndex; wrist: PoseLandmarkIndex }
> = {
  left: {
    shoulder: POSE_LANDMARK.LEFT_SHOULDER,
    elbow: POSE_LANDMARK.LEFT_ELBOW,
    wrist: POSE_LANDMARK.LEFT_WRIST,
  },
  right: {
    shoulder: POSE_LANDMARK.RIGHT_SHOULDER,
    elbow: POSE_LANDMARK.RIGHT_ELBOW,
    wrist: POSE_LANDMARK.RIGHT_WRIST,
  },
};

const SHOULDER_INDICES: Record<
  AngleSide,
  { hip: PoseLandmarkIndex; shoulder: PoseLandmarkIndex; elbow: PoseLandmarkIndex }
> = {
  left: {
    hip: POSE_LANDMARK.LEFT_HIP,
    shoulder: POSE_LANDMARK.LEFT_SHOULDER,
    elbow: POSE_LANDMARK.LEFT_ELBOW,
  },
  right: {
    hip: POSE_LANDMARK.RIGHT_HIP,
    shoulder: POSE_LANDMARK.RIGHT_SHOULDER,
    elbow: POSE_LANDMARK.RIGHT_ELBOW,
  },
};

/** Knee angle: hip → knee → ankle. */
export function kneeAngle(side: AngleSide, smoothed: ProcessedPoseLandmarks): AngleValue {
  const indices = KNEE_INDICES[side];
  return computeJointAngle(smoothed, indices.hip, indices.knee, indices.ankle);
}

/** Hip angle: shoulder → hip → knee. */
export function hipAngle(side: AngleSide, smoothed: ProcessedPoseLandmarks): AngleValue {
  const indices = HIP_INDICES[side];
  return computeJointAngle(smoothed, indices.shoulder, indices.hip, indices.knee);
}

/** Ankle angle: knee → ankle → foot_index. */
export function ankleAngle(side: AngleSide, smoothed: ProcessedPoseLandmarks): AngleValue {
  const indices = ANKLE_INDICES[side];
  return computeJointAngle(smoothed, indices.knee, indices.ankle, indices.footIndex);
}

/** Elbow angle: shoulder → elbow → wrist. */
export function elbowAngle(side: AngleSide, smoothed: ProcessedPoseLandmarks): AngleValue {
  const indices = ELBOW_INDICES[side];
  return computeJointAngle(smoothed, indices.shoulder, indices.elbow, indices.wrist);
}

/** Shoulder angle: hip → shoulder → elbow. */
export function shoulderAngle(side: AngleSide, smoothed: ProcessedPoseLandmarks): AngleValue {
  const indices = SHOULDER_INDICES[side];
  return computeJointAngle(smoothed, indices.hip, indices.shoulder, indices.elbow);
}

/**
 * Trunk angle: angular deviation of the shoulder-midpoint → hip-midpoint
 * vector from the screen-vertical axis. Computed in Phase 18 normalized
 * (torso-scale) space when available, else falls back to smoothed
 * image-space — image-space `y` increases downward, so we negate the
 * `y` component so an upright body still maps to `0°`.
 *
 * `0°` means upright relative to the camera frame.
 */
export function trunkAngle(
  smoothed: ProcessedPoseLandmarks,
  normalized: NormalizedPoseLandmarks | null,
): AngleValue {
  const usedLandmarks: ReadonlyArray<string> = [
    nameOf(POSE_LANDMARK.LEFT_SHOULDER),
    nameOf(POSE_LANDMARK.RIGHT_SHOULDER),
    nameOf(POSE_LANDMARK.LEFT_HIP),
    nameOf(POSE_LANDMARK.RIGHT_HIP),
  ];

  const sourceSpace: AngleSourceSpace = normalized !== null ? 'normalized' : 'smoothed';

  const leftShoulder =
    normalized !== null
      ? sampleNormalized(normalized, POSE_LANDMARK.LEFT_SHOULDER)
      : sampleSmoothed(smoothed, POSE_LANDMARK.LEFT_SHOULDER);
  const rightShoulder =
    normalized !== null
      ? sampleNormalized(normalized, POSE_LANDMARK.RIGHT_SHOULDER)
      : sampleSmoothed(smoothed, POSE_LANDMARK.RIGHT_SHOULDER);
  const leftHip =
    normalized !== null
      ? sampleNormalized(normalized, POSE_LANDMARK.LEFT_HIP)
      : sampleSmoothed(smoothed, POSE_LANDMARK.LEFT_HIP);
  const rightHip =
    normalized !== null
      ? sampleNormalized(normalized, POSE_LANDMARK.RIGHT_HIP)
      : sampleSmoothed(smoothed, POSE_LANDMARK.RIGHT_HIP);

  if (
    leftShoulder === undefined ||
    rightShoulder === undefined ||
    leftHip === undefined ||
    rightHip === undefined
  ) {
    return unavailableAngle('key-landmarks-missing', usedLandmarks, sourceSpace);
  }

  if (
    !leftShoulder.isVisible ||
    !rightShoulder.isVisible ||
    !leftHip.isVisible ||
    !rightHip.isVisible
  ) {
    return {
      ...unavailableAngle('key-landmarks-occluded', usedLandmarks, sourceSpace),
      visibility: meanVisibility([leftShoulder, rightShoulder, leftHip, rightHip]),
    };
  }

  const shoulderMidX = (leftShoulder.point.x + rightShoulder.point.x) / 2;
  const shoulderMidY = (leftShoulder.point.y + rightShoulder.point.y) / 2;
  const hipMidX = (leftHip.point.x + rightHip.point.x) / 2;
  const hipMidY = (leftHip.point.y + rightHip.point.y) / 2;

  // Vector from shoulder midpoint to hip midpoint, oriented so that an
  // upright body produces a vector pointing along screen-up (image-space
  // `y` grows downward; normalized space has hip midpoint at origin and
  // shoulders above with negative `y`).
  const vx = hipMidX - shoulderMidX;
  // For both spaces, "down the body" in image coordinates is `+y`. We
  // want the angle relative to screen vertical regardless of sign, so
  // flip the `y` component to make upright = vector pointing along +y.
  const vy = -(hipMidY - shoulderMidY);

  const math = angleFromVertical2D(vx, vy);
  if (math.status !== 'available' || math.valueDegrees === null) {
    const reason = math.status === 'available' ? 'numeric-instability' : math.status;
    return {
      ...unavailableAngle(reason, usedLandmarks, sourceSpace),
      visibility: meanVisibility([leftShoulder, rightShoulder, leftHip, rightHip]),
    };
  }

  return {
    valueDegrees: math.valueDegrees,
    status: 'available',
    unit: 'degrees',
    usedLandmarks,
    visibility: meanVisibility([leftShoulder, rightShoulder, leftHip, rightHip]),
    sourceSpace,
  };
}

/**
 * Knee valgus metric (lateral deviation ratio, NOT degrees).
 *
 * In Phase 18 normalized space, project the knee onto the hip → ankle
 * line and return the signed perpendicular offset divided by the
 * hip → ankle length. Positive values mean the knee deviates toward
 * the body midline (cave-in / valgus); negative toward the outside
 * (varus / "bow-out"). Magnitude is a unit-less ratio in roughly
 * `[0, ~0.5]` for realistic squats.
 *
 * Requires normalization — image-space pixels would conflate distance
 * from camera with deviation magnitude, so we deliberately return
 * `normalization-unavailable` rather than report a misleading value.
 */
export function kneeValgus(
  side: AngleSide,
  normalized: NormalizedPoseLandmarks | null,
): AngleMetricValue {
  const indices = KNEE_INDICES[side];
  const usedLandmarks: ReadonlyArray<string> = [
    nameOf(indices.hip),
    nameOf(indices.knee),
    nameOf(indices.ankle),
  ];

  if (normalized === null) {
    return unavailableMetric(
      'normalization-unavailable',
      usedLandmarks,
      'normalized',
      'Knee valgus requires normalized landmarks.',
    );
  }

  const hip = sampleNormalized(normalized, indices.hip);
  const knee = sampleNormalized(normalized, indices.knee);
  const ankle = sampleNormalized(normalized, indices.ankle);

  if (hip === undefined || knee === undefined || ankle === undefined) {
    return unavailableMetric('key-landmarks-missing', usedLandmarks, 'normalized');
  }
  if (!hip.isVisible || !knee.isVisible || !ankle.isVisible) {
    return {
      ...unavailableMetric('key-landmarks-occluded', usedLandmarks, 'normalized'),
      visibility: meanVisibility([hip, knee, ankle]),
    };
  }

  const lineX = ankle.point.x - hip.point.x;
  const lineY = ankle.point.y - hip.point.y;
  const lineLength = vectorLength2D(lineX, lineY);
  if (lineLength < 1e-6) {
    return {
      ...unavailableMetric('numeric-instability', usedLandmarks, 'normalized'),
      visibility: meanVisibility([hip, knee, ankle]),
    };
  }

  // Signed perpendicular offset of the knee from the hip → ankle line,
  // using the 2D cross product (z component). Normalize the orientation
  // so positive values consistently mean "toward the body midline"
  // regardless of side: midline is `x = 0` in torso-normalized space,
  // so the left knee is at negative x (its outside is more negative)
  // and the right knee is at positive x (its outside is more positive).
  const cross = lineX * (knee.point.y - hip.point.y) - lineY * (knee.point.x - hip.point.x);
  const rawRatio = cross / (lineLength * lineLength);
  if (!Number.isFinite(rawRatio)) {
    return {
      ...unavailableMetric('numeric-instability', usedLandmarks, 'normalized'),
      visibility: meanVisibility([hip, knee, ankle]),
    };
  }

  // Sign convention: positive = valgus (knee cave-in toward midline).
  // For the left leg the midline is in the `+x` direction → negate.
  // For the right leg the midline is in the `-x` direction → keep.
  // The 2D cross-product sign also depends on which side of the line
  // the knee sits on; combining both yields the convention above.
  const signedRatio = side === 'left' ? rawRatio : -rawRatio;

  return {
    value: signedRatio,
    status: 'available',
    unit: 'ratio',
    usedLandmarks,
    visibility: meanVisibility([hip, knee, ankle]),
    sourceSpace: 'normalized',
  };
}

/**
 * Hip symmetry metric (height-delta ratio, NOT degrees).
 *
 * Returns the vertical offset between the left and right hip,
 * normalized by the hip-to-hip distance, in Phase 18 normalized space.
 *
 * Sign convention: positive values mean the right hip sits higher than
 * the left in image space (note that image-space `y` grows downward,
 * so "higher" means smaller `y` — the helper accounts for that). `0`
 * means perfectly level hips.
 */
export function hipSymmetry(normalized: NormalizedPoseLandmarks | null): AngleMetricValue {
  const usedLandmarks: ReadonlyArray<string> = [
    nameOf(POSE_LANDMARK.LEFT_HIP),
    nameOf(POSE_LANDMARK.RIGHT_HIP),
  ];

  if (normalized === null) {
    return unavailableMetric(
      'normalization-unavailable',
      usedLandmarks,
      'normalized',
      'Hip symmetry requires normalized landmarks.',
    );
  }

  const leftHip = sampleNormalized(normalized, POSE_LANDMARK.LEFT_HIP);
  const rightHip = sampleNormalized(normalized, POSE_LANDMARK.RIGHT_HIP);

  if (leftHip === undefined || rightHip === undefined) {
    return unavailableMetric('key-landmarks-missing', usedLandmarks, 'normalized');
  }
  if (!leftHip.isVisible || !rightHip.isVisible) {
    return {
      ...unavailableMetric('key-landmarks-occluded', usedLandmarks, 'normalized'),
      visibility: meanVisibility([leftHip, rightHip]),
    };
  }

  const widthX = rightHip.point.x - leftHip.point.x;
  const widthY = rightHip.point.y - leftHip.point.y;
  const width = vectorLength2D(widthX, widthY);
  if (width < 1e-6) {
    return {
      ...unavailableMetric('numeric-instability', usedLandmarks, 'normalized'),
      visibility: meanVisibility([leftHip, rightHip]),
    };
  }

  // Image-space `y` grows downward, so a *smaller* y means visually
  // higher on screen. Right-higher → leftHip.y > rightHip.y → positive.
  const heightDelta = leftHip.point.y - rightHip.point.y;
  const ratio = heightDelta / width;

  if (!Number.isFinite(ratio)) {
    return {
      ...unavailableMetric('numeric-instability', usedLandmarks, 'normalized'),
      visibility: meanVisibility([leftHip, rightHip]),
    };
  }

  return {
    value: ratio,
    status: 'available',
    unit: 'ratio',
    usedLandmarks,
    visibility: meanVisibility([leftHip, rightHip]),
    sourceSpace: 'normalized',
  };
}
