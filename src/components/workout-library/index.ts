/**
 * Phase 14 — Motionly Workout Library composite components.
 *
 * Explicit named exports keep imports tree-shakable and refactor-safe.
 * Add new library components here so the page has one stable entry
 * point. The barrel does NOT re-export Phase 8 primitives or Phase 9
 * feedback components — keep import paths honest:
 *
 *   import { WorkoutCard } from '@components/workout-library';
 *   import { Card } from '@components/primitives';
 *   import { EmptyState } from '@components/feedback';
 */

export { ARTWORK_GRADIENT_CLASS } from './artwork';
export {
  categoryLabel,
  exerciseDifficultyLabel,
  muscleGroupLabel,
  workoutDifficultyLabel,
} from './labels';
export { WorkoutLibraryHeader } from './WorkoutLibraryHeader';
export { LibraryTabSwitcher } from './LibraryTabSwitcher';
export { WorkoutFilterChips } from './WorkoutFilterChips';
export { ExerciseFilterBar } from './ExerciseFilterBar';
export { WorkoutCard } from './WorkoutCard';
export { ExerciseCard } from './ExerciseCard';
export { LockedContentBadge } from './LockedContentBadge';
export { LibraryEmptyState } from './LibraryEmptyState';
export { ExerciseQuickDetailPanel } from './ExerciseQuickDetailPanel';
