/**
 * Phase 17 — MediaPipe Pose Landmarker landmark name constants.
 *
 * The MediaPipe Pose Landmarker emits **33** keypoints per frame in a
 * fixed order. These constants make consuming code refer to landmarks
 * by name (e.g. `LEFT_KNEE`) instead of magic numbers.
 *
 * Order matches MediaPipe's published Pose Landmarker spec exactly:
 * https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker
 *
 * Phase 17 scope:
 * - These constants are used for debug rendering (overlay dot labels,
 *   "first few landmarks" debug log).
 * - No confidence filtering, no smoothing, no joint angle math, no
 *   skeletal connections are derived here — those land in Phases 18+.
 */

export const POSE_LANDMARK_COUNT = 33 as const;

export const POSE_LANDMARK = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

export type PoseLandmarkName = keyof typeof POSE_LANDMARK;
export type PoseLandmarkIndex = (typeof POSE_LANDMARK)[PoseLandmarkName];

/**
 * Reverse lookup `index -> name`. Useful for the Phase 17 debug
 * "Log current landmarks" button so log lines read as names instead
 * of magic numbers.
 */
export const POSE_LANDMARK_NAMES: ReadonlyArray<PoseLandmarkName> = (
  Object.entries(POSE_LANDMARK) as Array<[PoseLandmarkName, number]>
)
  .sort(([, a], [, b]) => a - b)
  .map(([name]) => name);

/**
 * Indices of the body landmarks Phase 17 cares about for the debug
 * overlay's "is a real body visible?" cue. Real visibility scoring
 * lands in Phase 18 — these are only used to render a small set of
 * dots that look like a person, never to fabricate a confidence value.
 */
export const POSE_KEY_BODY_INDICES: ReadonlyArray<PoseLandmarkIndex> = [
  POSE_LANDMARK.LEFT_SHOULDER,
  POSE_LANDMARK.RIGHT_SHOULDER,
  POSE_LANDMARK.LEFT_ELBOW,
  POSE_LANDMARK.RIGHT_ELBOW,
  POSE_LANDMARK.LEFT_WRIST,
  POSE_LANDMARK.RIGHT_WRIST,
  POSE_LANDMARK.LEFT_HIP,
  POSE_LANDMARK.RIGHT_HIP,
  POSE_LANDMARK.LEFT_KNEE,
  POSE_LANDMARK.RIGHT_KNEE,
  POSE_LANDMARK.LEFT_ANKLE,
  POSE_LANDMARK.RIGHT_ANKLE,
];
