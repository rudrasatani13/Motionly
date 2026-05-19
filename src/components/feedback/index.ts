/**
 * Phase 9 — Motionly feedback / status / progress components.
 *
 * Explicit named exports keep imports tree-shakable and refactor-safe.
 * Add new feedback components here so consumers have one stable entry
 * point. The barrel deliberately does **not** re-export Phase 8
 * primitives or Phase 6 routing helpers — keep import paths honest:
 *
 *   import { CircularProgress, ToastProvider } from '@components/feedback';
 *   import { Button, Card } from '@components/primitives';
 */

export { CircularProgress, type CircularProgressSize } from './CircularProgress';
export { LinearProgress, type LinearProgressSize, type LinearProgressTone } from './LinearProgress';
export { ScoreBadge, type ScoreBadgeSize } from './ScoreBadge';
export { FormCueCard, type FormCueTone } from './FormCueCard';
export { RepCounter, type RepCounterSize } from './RepCounter';
export { WorkoutTimer, type WorkoutTimerMode, type WorkoutTimerSize } from './WorkoutTimer';
export {
  ToastProvider,
  ToastViewport,
  useToast,
  type ShowToastInput,
  type Toast,
  type ToastAction,
  type ToastTone,
} from './Toast';
export { SkeletonLoader, type SkeletonShape } from './SkeletonLoader';
export { EmptyState } from './EmptyState';
export { ErrorBoundary } from './ErrorBoundary';
export { ConfidenceIndicator, type ConfidenceStatus } from './ConfidenceIndicator';
