/**
 * Phase 14 — Workout Library domain types.
 *
 * These types describe the shape of Motionly's canonical browsing
 * catalog: workout summaries (cards on the Workouts tab) and exercise
 * summaries (cards on the Exercises tab) plus the filter shapes the
 * library page uses to narrow the lists locally.
 *
 * Rules:
 * - Library types describe **product content**, never user data.
 *   There are no fields for completion counts, ratings, popularity,
 *   form scores, AI feedback, or subscription state — those belong
 *   to later phases.
 * - Phase 15+ (workout detail, pre-workout, active workout) will
 *   extend these types with the per-exercise sequence and coaching
 *   notes. Until then, keep this file scoped to what the browse
 *   surface actually needs.
 */

/** Granularity used in workout & exercise difficulty filters. */
export type WorkoutDifficulty = 'beginner' | 'intermediate' | 'advanced';

/** Per-exercise difficulty (mirrors workout difficulty today). */
export type ExerciseDifficulty = WorkoutDifficulty;

/**
 * High-level workout category used both for filter chips and for
 * the meta line on each workout card.
 */
export type WorkoutCategory =
  | 'strength'
  | 'mobility'
  | 'full_body'
  | 'lower_body'
  | 'upper_body'
  | 'core'
  | 'quick';

/**
 * Coarse duration bucket. Phase 14 only uses `quick` (<=15min) on the
 * filter chips today, but the full set is declared here so later
 * phases can extend filtering without changing the type surface.
 */
export type WorkoutDurationBucket = 'quick' | 'standard' | 'long';

/**
 * Free vs paid (Pro) gating. Phase 14 displays locked content but
 * does **not** implement real subscription state.
 */
export type WorkoutAccessTier = 'free' | 'pro';

/** Muscle group used for exercise-tab filtering and card meta. */
export type MuscleGroup =
  | 'legs'
  | 'glutes'
  | 'core'
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'hips'
  | 'full_body';

/**
 * Optional, token-based illustration hint for a workout or exercise
 * card. Phase 14 ships **no** photographic media — the library uses
 * abstract gradients/icons keyed off these tones.
 */
export type LibraryArtworkTone = 'primary' | 'accent' | 'neutral' | 'warning' | 'sky' | 'rose';

/** Minimum data the Workouts tab needs to render a card. */
export type WorkoutSummary = {
  /** Stable id used for `/workouts/:id` and React keys. */
  id: string;
  /** Display name, e.g. "Lower Body Foundations". */
  name: string;
  /** Short, honest description (<= 140 chars). */
  description: string;
  /** Total duration in minutes. */
  durationMinutes: number;
  /** Number of exercises in the session. */
  exerciseCount: number;
  /** Difficulty bucket. */
  difficulty: WorkoutDifficulty;
  /** One or more categories. */
  categories: WorkoutCategory[];
  /** Equipment string. Most MVP workouts are "None". */
  equipment: string;
  /** Access tier — locked workouts stay visible but show a lock badge. */
  accessTier: WorkoutAccessTier;
  /** One-line coaching focus shown under the meta row on the card. */
  coachingFocus: string;
  /** Optional token-based artwork tone. Defaults to `primary`. */
  artworkTone?: LibraryArtworkTone;
};

/** Minimum data the Exercises tab needs to render a card. */
export type ExerciseSummary = {
  /** Stable id used for keys and the quick-detail panel state. */
  id: string;
  /** Display name. */
  name: string;
  /** Primary muscles trained. */
  targetMuscles: MuscleGroup[];
  /** Difficulty bucket. */
  difficulty: ExerciseDifficulty;
  /** Equipment string. */
  equipment: string;
  /** Short, honest description (<= 140 chars). */
  description: string;
  /**
   * Future-oriented coaching cues — the things Motionly **will**
   * coach once pose detection and form scoring land in later phases.
   */
  whatMotionlyWillCoach: string[];
  /** One-line camera placement guidance (Phase 16 setup will replace it). */
  cameraPlacementSummary: string;
  /** Access tier. */
  accessTier: WorkoutAccessTier;
  /** Optional step-by-step instructions for the quick-detail panel. */
  instructions?: string[];
  /** Optional default per-set seconds (e.g. for plank-like holds). */
  estimatedSeconds?: number;
  /** Optional reps range for rep-based movements. */
  estimatedRepsRange?: string;
  /** Optional token-based artwork tone. Defaults to `accent`. */
  artworkTone?: LibraryArtworkTone;
};

/** Top-level tab selection for the Workout Library page. */
export type LibraryTab = 'workouts' | 'exercises';

/** Workouts-tab filter chip identifiers (mutually exclusive). */
export type WorkoutFilterChip =
  | 'all'
  | 'beginner'
  | 'intermediate'
  | 'quick'
  | 'strength'
  | 'mobility';

/** State shape carried by the Workouts tab. */
export type WorkoutLibraryFilters = {
  /** Currently-selected filter chip. `'all'` is the default. */
  chip: WorkoutFilterChip;
  /** Optional case-insensitive search query. Empty string = no search. */
  query: string;
};

/** State shape carried by the Exercises tab. */
export type ExerciseLibraryFilters = {
  /** Active muscle filter, or `null` for "All". */
  muscle: MuscleGroup | null;
  /** Active difficulty filter, or `null` for "All". */
  difficulty: ExerciseDifficulty | null;
  /** Case-insensitive search query. */
  query: string;
};
