import type {
  ExerciseDifficulty,
  MuscleGroup,
  WorkoutCategory,
  WorkoutDifficulty,
} from '@/types/workout-library';

/**
 * Human-readable labels for the enum-style domain values used in
 * the Workout Library. Centralizing them here means card components
 * and filter controls always agree on the display string for the
 * same underlying value.
 */

export function workoutDifficultyLabel(difficulty: WorkoutDifficulty): string {
  switch (difficulty) {
    case 'beginner':
      return 'Beginner';
    case 'intermediate':
      return 'Intermediate';
    case 'advanced':
      return 'Advanced';
  }
}

export function exerciseDifficultyLabel(difficulty: ExerciseDifficulty): string {
  return workoutDifficultyLabel(difficulty);
}

export function categoryLabel(category: WorkoutCategory): string {
  switch (category) {
    case 'strength':
      return 'Strength';
    case 'mobility':
      return 'Mobility';
    case 'full_body':
      return 'Full body';
    case 'lower_body':
      return 'Lower body';
    case 'upper_body':
      return 'Upper body';
    case 'core':
      return 'Core';
    case 'quick':
      return 'Quick';
  }
}

export function muscleGroupLabel(muscle: MuscleGroup): string {
  switch (muscle) {
    case 'legs':
      return 'Legs';
    case 'glutes':
      return 'Glutes';
    case 'core':
      return 'Core';
    case 'chest':
      return 'Chest';
    case 'back':
      return 'Back';
    case 'shoulders':
      return 'Shoulders';
    case 'arms':
      return 'Arms';
    case 'hips':
      return 'Hips';
    case 'full_body':
      return 'Full body';
  }
}
