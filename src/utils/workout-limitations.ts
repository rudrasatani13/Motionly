/**
 * Phase 15 — Pure workout limitation matching.
 *
 * Compares the user's real Phase 12 onboarding limitations with the
 * selected workout's canonical exercise sequence. This helper is
 * intentionally local and informational: no React, no DOM, no network,
 * no scoring, and no blocking behavior.
 */

import type {
  WorkoutDetail,
  WorkoutLimitationArea,
  WorkoutLimitationConflict,
} from '@/types/workout-library';

const LIMITATION_AREAS: ReadonlyArray<WorkoutLimitationArea> = [
  'lower_back',
  'knees',
  'shoulders',
  'hips',
  'ankles',
  'wrists',
];

const MOVEMENT_TYPE_BY_EXERCISE_ID: Record<string, string> = {
  'bodyweight-squat': 'squats',
  'reverse-lunge': 'lunges',
  'glute-bridge': 'glute bridges',
  'incline-push-up': 'push-ups',
  plank: 'planks',
  'dead-bug': 'dead bugs',
  'bird-dog': 'bird dogs',
  'hip-hinge': 'hip hinges',
  'shoulder-taps': 'shoulder taps',
  'calf-raise': 'calf raises',
  'cat-cow': 'cat-cow',
  'standing-hamstring-walkout': 'hamstring walkouts',
  'wall-press': 'wall presses',
};

function isWorkoutLimitationArea(value: string): value is WorkoutLimitationArea {
  return LIMITATION_AREAS.includes(value as WorkoutLimitationArea);
}

export function limitationAreaLabel(area: WorkoutLimitationArea): string {
  switch (area) {
    case 'lower_back':
      return 'lower back';
    case 'knees':
      return 'knees';
    case 'shoulders':
      return 'shoulders';
    case 'hips':
      return 'hips';
    case 'ankles':
      return 'ankles';
    case 'wrists':
      return 'wrists';
  }
}

function uniqueValues(values: Iterable<string>): string[] {
  return Array.from(new Set(values));
}

/**
 * Return gentle pre-workout conflicts for selected limitation areas.
 *
 * Missing onboarding data, an empty limitations list, or an explicit
 * `none` selection returns no conflicts. The caller may show no
 * warning in those cases.
 */
export function findWorkoutLimitationConflicts(
  workout: WorkoutDetail,
  onboardingLimitations: ReadonlyArray<string> | null | undefined,
): WorkoutLimitationConflict[] {
  if (
    onboardingLimitations === null ||
    onboardingLimitations === undefined ||
    onboardingLimitations.length === 0 ||
    onboardingLimitations.includes('none')
  ) {
    return [];
  }

  const selectedAreas = uniqueValues(onboardingLimitations).filter(isWorkoutLimitationArea);

  return selectedAreas
    .map((area) => {
      const movementTypes: string[] = [];
      const exerciseIds: string[] = [];

      for (const item of workout.exerciseSequence) {
        if (!item.limitationTags?.includes(area)) {
          continue;
        }
        exerciseIds.push(item.exerciseId);
        movementTypes.push(MOVEMENT_TYPE_BY_EXERCISE_ID[item.exerciseId] ?? 'tagged movements');
      }

      return {
        area,
        areaLabel: limitationAreaLabel(area),
        movementTypes: uniqueValues(movementTypes),
        exerciseIds: uniqueValues(exerciseIds),
      };
    })
    .filter((conflict) => conflict.exerciseIds.length > 0);
}
