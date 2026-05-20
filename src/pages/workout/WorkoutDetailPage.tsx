import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { findExerciseById } from '@/data/workout-library';
import { useToast } from '@components/feedback';
import { Button, Column, Icon } from '@components/primitives';
import {
  CoachNoteCard,
  ExerciseSequenceList,
  LimitationWarningCard,
  PreWorkoutActions,
  WorkoutDetailHero,
  WorkoutDetailSkeleton,
  WorkoutMetaRow,
  WorkoutMuscleChips,
  WorkoutNotFoundState,
  type ResolvedExerciseSequenceItem,
} from '@components/workout-detail';
import { useNavigation } from '@hooks/useNavigation';
import { useWorkoutDetailData } from '@hooks/useWorkoutDetailData';
import type { WorkoutDetailRouteParams } from '@router/routeTypes';

export default function WorkoutDetailPage(): JSX.Element {
  const { id } = useParams<WorkoutDetailRouteParams>();
  const navigation = useNavigation();
  const toast = useToast();
  const workoutState = useWorkoutDetailData(id);

  const resolvedSequence = useMemo<ReadonlyArray<ResolvedExerciseSequenceItem>>(() => {
    if (workoutState.detail === null) {
      return [];
    }
    return workoutState.detail.exerciseSequence
      .map((item) => {
        const exercise = findExerciseById(item.exerciseId);
        if (exercise === undefined) {
          return null;
        }
        return { item, exercise };
      })
      .filter((item): item is ResolvedExerciseSequenceItem => item !== null);
  }, [workoutState.detail]);

  if (workoutState.status === 'loading') {
    return <WorkoutDetailSkeleton />;
  }

  if (workoutState.status === 'notFound') {
    return <WorkoutNotFoundState onBackToLibrary={navigation.goToWorkouts} />;
  }

  const { detail } = workoutState;
  const locked = workoutState.status === 'locked';

  const handlePrimaryAction = (): void => {
    if (locked) {
      toast.show({
        tone: 'info',
        title: 'Pro workout locked',
        message:
          'Paid plans are implemented in a later phase. Opening the paywall placeholder for now.',
      });
      navigation.goToPaywall();
      return;
    }

    navigation.goToWorkoutSetup(detail.id);
  };

  return (
    <section className="mx-auto flex w-full flex-col gap-6 px-4 pb-8 pt-6 sm:px-6 sm:pt-8">
      <div>
        <Button
          variant="ghost"
          size="md"
          leftIcon={<Icon icon={ArrowLeft} size="sm" />}
          onClick={navigation.goToWorkouts}
          aria-label="Back to Workout Library"
        >
          Back to library
        </Button>
      </div>

      <WorkoutDetailHero workout={detail} locked={locked} />

      <Column gap="lg">
        <WorkoutMetaRow workout={detail} />

        <LimitationWarningCard
          conflicts={workoutState.conflicts}
          onBackToLibrary={navigation.goToWorkouts}
        />

        <WorkoutMuscleChips
          primaryMuscles={detail.primaryMusclesWorked}
          secondaryMuscles={detail.secondaryMusclesWorked}
        />

        <ExerciseSequenceList items={resolvedSequence} />

        <CoachNoteCard note={detail.coachNote} />
      </Column>

      <PreWorkoutActions
        accessTier={detail.accessTier}
        onPrimaryAction={handlePrimaryAction}
        onBackToLibrary={navigation.goToWorkouts}
      />
    </section>
  );
}
