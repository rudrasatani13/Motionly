/**
 * Phase 14 — Pure helpers for filtering and searching the workout
 * library catalog.
 *
 * Rules:
 * - No React, no DOM, no network calls.
 * - Inputs are immutable; helpers return new arrays.
 * - Case-insensitive search uses a normalized `includes` — no fuzzy
 *   dependency is pulled in for the MVP catalog size.
 * - The "Quick" filter is a fixed duration threshold (<= 15 min) so
 *   the chip behavior matches the wireframe copy literally.
 */

import type {
  ExerciseLibraryFilters,
  ExerciseSummary,
  MuscleGroup,
  WorkoutCategory,
  WorkoutFilterChip,
  WorkoutLibraryFilters,
  WorkoutSummary,
} from '@/types/workout-library';

/** Upper bound (inclusive) used by the "Quick <=15min" chip. */
export const QUICK_WORKOUT_MAX_MINUTES = 15;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function categoryLabel(category: WorkoutCategory): string {
  switch (category) {
    case 'strength':
      return 'strength';
    case 'mobility':
      return 'mobility';
    case 'full_body':
      return 'full body';
    case 'lower_body':
      return 'lower body';
    case 'upper_body':
      return 'upper body';
    case 'core':
      return 'core';
    case 'quick':
      return 'quick';
  }
}

function muscleLabel(muscle: MuscleGroup): string {
  switch (muscle) {
    case 'legs':
      return 'legs';
    case 'glutes':
      return 'glutes';
    case 'core':
      return 'core';
    case 'chest':
      return 'chest';
    case 'back':
      return 'back';
    case 'shoulders':
      return 'shoulders';
    case 'arms':
      return 'arms';
    case 'hips':
      return 'hips';
    case 'full_body':
      return 'full body';
  }
}

function matchesWorkoutChip(workout: WorkoutSummary, chip: WorkoutFilterChip): boolean {
  switch (chip) {
    case 'all':
      return true;
    case 'beginner':
      return workout.difficulty === 'beginner';
    case 'intermediate':
      return workout.difficulty === 'intermediate';
    case 'quick':
      return (
        workout.durationMinutes <= QUICK_WORKOUT_MAX_MINUTES || workout.categories.includes('quick')
      );
    case 'strength':
      return workout.categories.includes('strength');
    case 'mobility':
      return workout.categories.includes('mobility');
  }
}

function workoutSearchHaystack(workout: WorkoutSummary): string {
  return [
    workout.name,
    workout.description,
    workout.coachingFocus,
    workout.difficulty,
    ...workout.categories.map(categoryLabel),
  ]
    .join(' ')
    .toLowerCase();
}

function exerciseSearchHaystack(exercise: ExerciseSummary): string {
  return [
    exercise.name,
    exercise.description,
    exercise.difficulty,
    exercise.equipment,
    ...exercise.targetMuscles.map(muscleLabel),
    ...exercise.whatMotionlyWillCoach,
  ]
    .join(' ')
    .toLowerCase();
}

/**
 * Filter workouts by the active chip selection. Pure function; the
 * input array is not mutated.
 */
export function filterWorkouts(
  workouts: ReadonlyArray<WorkoutSummary>,
  filters: WorkoutLibraryFilters,
): WorkoutSummary[] {
  const filteredByChip = workouts.filter((workout) => matchesWorkoutChip(workout, filters.chip));
  return searchWorkouts(filteredByChip, filters.query);
}

/**
 * Filter exercises by muscle group, difficulty, and a free-text
 * query. Empty muscle/difficulty selections match everything.
 */
export function filterExercises(
  exercises: ReadonlyArray<ExerciseSummary>,
  filters: ExerciseLibraryFilters,
): ExerciseSummary[] {
  const matched = exercises.filter((exercise) => {
    if (filters.muscle !== null && !exercise.targetMuscles.includes(filters.muscle)) {
      return false;
    }
    if (filters.difficulty !== null && exercise.difficulty !== filters.difficulty) {
      return false;
    }
    return true;
  });
  return searchExercises(matched, filters.query);
}

/**
 * Narrow a workout list by a case-insensitive substring search over
 * name, description, coaching focus, difficulty, and category names.
 * Empty/whitespace queries return the input as-is.
 */
export function searchWorkouts(
  workouts: ReadonlyArray<WorkoutSummary>,
  query: string,
): WorkoutSummary[] {
  const needle = normalize(query);
  if (needle.length === 0) {
    return [...workouts];
  }
  return workouts.filter((workout) => workoutSearchHaystack(workout).includes(needle));
}

/**
 * Narrow an exercise list by a case-insensitive substring search
 * over name, description, difficulty, equipment, muscle labels, and
 * the "what Motionly will coach" cues.
 */
export function searchExercises(
  exercises: ReadonlyArray<ExerciseSummary>,
  query: string,
): ExerciseSummary[] {
  const needle = normalize(query);
  if (needle.length === 0) {
    return [...exercises];
  }
  return exercises.filter((exercise) => exerciseSearchHaystack(exercise).includes(needle));
}

const WORKOUT_DIFFICULTY_ORDER: Record<WorkoutSummary['difficulty'], number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

/**
 * Sort workouts by difficulty (beginner first) and then by duration.
 * Pure; the input array is not mutated.
 */
export function sortWorkouts(workouts: ReadonlyArray<WorkoutSummary>): WorkoutSummary[] {
  return [...workouts].sort((a, b) => {
    const diff = WORKOUT_DIFFICULTY_ORDER[a.difficulty] - WORKOUT_DIFFICULTY_ORDER[b.difficulty];
    if (diff !== 0) {
      return diff;
    }
    return a.durationMinutes - b.durationMinutes;
  });
}

/**
 * Sort exercises alphabetically by name within each difficulty
 * bracket (beginner first). Pure; the input array is not mutated.
 */
export function sortExercises(exercises: ReadonlyArray<ExerciseSummary>): ExerciseSummary[] {
  return [...exercises].sort((a, b) => {
    const diff = WORKOUT_DIFFICULTY_ORDER[a.difficulty] - WORKOUT_DIFFICULTY_ORDER[b.difficulty];
    if (diff !== 0) {
      return diff;
    }
    return a.name.localeCompare(b.name);
  });
}
