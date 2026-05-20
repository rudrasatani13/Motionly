/**
 * Phase 19 — Angle layer public surface.
 *
 * Single entry point for consumers (`@ml/angles`) so the hook, store,
 * and debug components don't depend on internal file layout.
 */

export {
  angleFromVertical2D,
  calculateAngle,
  calculateAngle3D,
  degreesFromRadians,
  dot2D,
  dot3D,
  safeClamp,
  vectorLength2D,
  vectorLength3D,
  type AngleMathResult,
} from './AngleCalculator';
export {
  ankleAngle,
  elbowAngle,
  hipAngle,
  hipSymmetry,
  kneeAngle,
  kneeValgus,
  shoulderAngle,
  trunkAngle,
} from './JointAngles';
export { AngleHistory, type AngleHistoryConfig } from './AngleHistory';
export {
  AngleFrameProcessor,
  emptyAngleStats,
  processAngleSnapshot,
  type AngleFrameProcessorConfig,
} from './processAngleSnapshot';
export { DEFAULT_ANGLE_HISTORY_CAPACITY, DEFAULT_ANGLE_VISIBILITY_THRESHOLD } from './angle-config';
