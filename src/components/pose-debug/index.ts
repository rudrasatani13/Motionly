/**
 * Phase 17 + 18 — Pose debug components barrel.
 *
 * Explicit named exports keep imports tree-shakable. These components
 * are deliberately small, low-emphasis, and developer-facing — they
 * exist to confirm the real MediaPipe pipeline (Phase 17) plus the
 * Phase 18 smoothing / filtering / normalization layer are alive, not
 * to ship a finished workout HUD.
 */

export { PoseDebugPanel } from './PoseDebugPanel';
export { PoseFpsBadge } from './PoseFpsBadge';
export { PoseLandmarkOverlay, type PoseOverlayMode } from './PoseLandmarkOverlay';
export { PoseLandmarkStatus } from './PoseLandmarkStatus';
export { PoseModelStatusCard } from './PoseModelStatusCard';
export { PoseProcessingStatsCard } from './PoseProcessingStatsCard';
export { PoseProcessingStatusCard } from './PoseProcessingStatusCard';
export { PoseVisibilityCard } from './PoseVisibilityCard';
