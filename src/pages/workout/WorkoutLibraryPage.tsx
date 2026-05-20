import { useCallback, useId, useMemo, useState } from 'react';

import { EXERCISE_CATALOG, WORKOUT_CATALOG } from '@/data/workout-library';
import type {
  ExerciseLibraryFilters,
  ExerciseSummary,
  LibraryTab,
  MuscleGroup,
  WorkoutFilterChip,
  WorkoutLibraryFilters,
  WorkoutSummary,
} from '@/types/workout-library';
import { useToast } from '@components/feedback';
import { Column } from '@components/primitives';
import {
  ExerciseCard,
  ExerciseFilterBar,
  ExerciseQuickDetailPanel,
  LibraryEmptyState,
  LibraryTabSwitcher,
  WorkoutCard,
  WorkoutFilterChips,
  WorkoutLibraryHeader,
} from '@components/workout-library';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useNavigation } from '@hooks/useNavigation';
import { filterExercises, filterWorkouts } from '@utils/workout-library';

const INITIAL_WORKOUT_FILTERS: WorkoutLibraryFilters = {
  chip: 'all',
  query: '',
};

const INITIAL_EXERCISE_FILTERS: ExerciseLibraryFilters = {
  muscle: null,
  difficulty: null,
  query: '',
};

/**
 * Order matches the broad "front of body → back of body → all" mental
 * model. Muscle groups not represented by the catalog are dropped at
 * render time so the chip row never advertises an empty filter.
 */
const MUSCLE_DISPLAY_ORDER: ReadonlyArray<MuscleGroup> = [
  'legs',
  'glutes',
  'hips',
  'core',
  'back',
  'chest',
  'shoulders',
  'arms',
  'full_body',
];

function buildAvailableMuscles(
  exercises: ReadonlyArray<ExerciseSummary>,
): ReadonlyArray<MuscleGroup> {
  const present = new Set<MuscleGroup>();
  for (const exercise of exercises) {
    for (const muscle of exercise.targetMuscles) {
      present.add(muscle);
    }
  }
  return MUSCLE_DISPLAY_ORDER.filter((muscle) => present.has(muscle));
}

/**
 * Phase 14 — Real Workout Library page.
 *
 * Renders the canonical static catalog from `@/data/workout-library`
 * and lets the user filter / search workouts and exercises locally.
 * No network, no fake users, no fake stats, no fake AI feedback,
 * no camera, no active workout. Free vs Pro is purely structural —
 * locked items stay visible and a tap routes to `/paywall` (still
 * a placeholder route) with an honest toast acknowledging that real
 * subscription state arrives later.
 */
export default function WorkoutLibraryPage(): JSX.Element {
  const navigation = useNavigation();
  const toast = useToast();
  const reactId = useId();

  const workoutsPanelId = `${reactId}-workouts-panel`;
  const exercisesPanelId = `${reactId}-exercises-panel`;

  const [tab, setTab] = useState<LibraryTab>('workouts');
  const [workoutFilters, setWorkoutFilters] =
    useState<WorkoutLibraryFilters>(INITIAL_WORKOUT_FILTERS);
  const [exerciseFilters, setExerciseFilters] =
    useState<ExerciseLibraryFilters>(INITIAL_EXERCISE_FILTERS);
  const [activeExercise, setActiveExercise] = useState<ExerciseSummary | null>(null);

  const debouncedExerciseQuery = useDebouncedValue(exerciseFilters.query, 200);

  const filteredWorkouts = useMemo(
    () => filterWorkouts(WORKOUT_CATALOG, workoutFilters),
    [workoutFilters],
  );

  const filteredExercises = useMemo(
    () =>
      filterExercises(EXERCISE_CATALOG, {
        ...exerciseFilters,
        query: debouncedExerciseQuery,
      }),
    [exerciseFilters, debouncedExerciseQuery],
  );

  const availableMuscles = useMemo(() => buildAvailableMuscles(EXERCISE_CATALOG), []);

  const handleTabChange = useCallback((next: LibraryTab): void => {
    setTab(next);
  }, []);

  const handleWorkoutChipChange = useCallback((chip: WorkoutFilterChip): void => {
    setWorkoutFilters((prev) => ({ ...prev, chip }));
  }, []);

  const handleResetWorkoutFilters = useCallback((): void => {
    setWorkoutFilters(INITIAL_WORKOUT_FILTERS);
  }, []);

  const handleResetExerciseFilters = useCallback((): void => {
    setExerciseFilters(INITIAL_EXERCISE_FILTERS);
  }, []);

  const handleWorkoutAction = useCallback(
    (workout: WorkoutSummary): void => {
      if (workout.accessTier === 'pro') {
        toast.show({
          tone: 'info',
          title: 'Pro workout locked',
          message:
            'Paid plans are implemented in a later phase. Opening the paywall placeholder for now.',
        });
        navigation.goToPaywall();
        return;
      }
      navigation.goToWorkoutDetail(workout.id);
    },
    [navigation, toast],
  );

  const handleOpenExerciseDetail = useCallback((exercise: ExerciseSummary): void => {
    setActiveExercise(exercise);
  }, []);

  const handleOpenLockedExercise = useCallback(
    (exercise: ExerciseSummary): void => {
      toast.show({
        tone: 'info',
        title: 'Pro exercise locked',
        message:
          'Paid plans are implemented in a later phase. Opening the paywall placeholder for now.',
        durationMs: 5000,
      });
      void exercise;
      navigation.goToPaywall();
    },
    [navigation, toast],
  );

  const handleCloseExerciseDetail = useCallback((): void => {
    setActiveExercise(null);
  }, []);

  return (
    <section
      aria-labelledby="workout-library-heading"
      className="mx-auto flex w-full flex-col gap-6 px-4 pb-8 pt-6 sm:px-6 sm:pt-8"
    >
      <WorkoutLibraryHeader />

      <LibraryTabSwitcher
        value={tab}
        onChange={handleTabChange}
        panelIds={{ workouts: workoutsPanelId, exercises: exercisesPanelId }}
      />

      {tab === 'workouts' ? (
        <Column gap="md" as="div" id={workoutsPanelId} role="tabpanel" aria-label="Workouts">
          <WorkoutFilterChips value={workoutFilters.chip} onChange={handleWorkoutChipChange} />

          {filteredWorkouts.length === 0 ? (
            <LibraryEmptyState
              title="No workouts match this filter"
              description="Try a different category or clear the filters to see the full catalog."
              onReset={handleResetWorkoutFilters}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredWorkouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} onAction={handleWorkoutAction} />
              ))}
            </div>
          )}
        </Column>
      ) : (
        <Column gap="md" as="div" id={exercisesPanelId} role="tabpanel" aria-label="Exercises">
          <ExerciseFilterBar
            filters={exerciseFilters}
            onChange={setExerciseFilters}
            availableMuscles={availableMuscles}
          />

          {filteredExercises.length === 0 ? (
            <LibraryEmptyState
              title="No exercises match this search"
              description="Try a shorter query or clear the filters to see every exercise."
              onReset={handleResetExerciseFilters}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onOpenDetail={handleOpenExerciseDetail}
                  onOpenLocked={handleOpenLockedExercise}
                />
              ))}
            </div>
          )}
        </Column>
      )}

      <ExerciseQuickDetailPanel exercise={activeExercise} onClose={handleCloseExerciseDetail} />
    </section>
  );
}
