/**
 * Phase 17 + 18 + 19 — Pose debug components barrel.
 *
 * Explicit named exports keep imports tree-shakable. These components
 * are deliberately small, low-emphasis, and developer-facing — they
 * exist to confirm the real MediaPipe pipeline (Phase 17), the
 * Phase 18 smoothing / filtering / normalization layer, and the
 * Phase 19 joint angle calculation layer are alive, not to ship a
 * finished workout HUD.
 */

export { AngleAvailabilityCard } from './AngleAvailabilityCard';
export { AngleDebugPanel } from './AngleDebugPanel';
export { AngleStatsCard } from './AngleStatsCard';
export { JointAngleGrid } from './JointAngleGrid';
export { PoseDebugPanel } from './PoseDebugPanel';
export { PoseFpsBadge } from './PoseFpsBadge';
export { PoseLandmarkOverlay, type PoseOverlayMode } from './PoseLandmarkOverlay';
export { PoseLandmarkStatus } from './PoseLandmarkStatus';
export { PoseModelStatusCard } from './PoseModelStatusCard';
export { PoseProcessingStatsCard } from './PoseProcessingStatsCard';
export { PoseProcessingStatusCard } from './PoseProcessingStatusCard';
export { PoseVisibilityCard } from './PoseVisibilityCard';
export { SquatDebugPanel } from './SquatDebugPanel';
