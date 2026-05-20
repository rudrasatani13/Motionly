import { useEffect, useMemo, useState } from 'react';

import { findWorkoutDetailById } from '@/data/workout-library';
import type { WorkoutDetail, WorkoutLimitationConflict } from '@/types/workout-library';
import { readOnboardingCompletion } from '@platform/onboarding-storage';
import { findWorkoutLimitationConflicts } from '@utils/workout-limitations';

export type WorkoutDetailDataState =
  | {
      status: 'loading';
      workoutId: string;
      detail: WorkoutDetail;
      conflicts: WorkoutLimitationConflict[];
    }
  | {
      status: 'notFound';
      workoutId: string | null;
      detail: null;
      conflicts: [];
    }
  | {
      status: 'locked';
      workoutId: string;
      detail: WorkoutDetail;
      conflicts: WorkoutLimitationConflict[];
    }
  | {
      status: 'ready';
      workoutId: string;
      detail: WorkoutDetail;
      conflicts: WorkoutLimitationConflict[];
    };

type LimitationReadState = {
  workoutId: string | null;
  status: 'loading' | 'resolved';
  conflicts: WorkoutLimitationConflict[];
};

/**
 * Resolve the static workout detail and enrich it with real local
 * onboarding limitation conflicts. No network calls, no writes, and no
 * fallback user data.
 */
export function useWorkoutDetailData(workoutId: string | undefined): WorkoutDetailDataState {
  const detail = useMemo(
    () => (workoutId === undefined ? undefined : findWorkoutDetailById(workoutId)),
    [workoutId],
  );

  const [limitationState, setLimitationState] = useState<LimitationReadState>(() => ({
    workoutId: workoutId ?? null,
    status: workoutId === undefined ? 'resolved' : 'loading',
    conflicts: [],
  }));

  useEffect(() => {
    if (workoutId === undefined || detail === undefined) {
      return undefined;
    }

    let cancelled = false;

    readOnboardingCompletion()
      .then((completion) => {
        if (cancelled) {
          return;
        }
        setLimitationState({
          workoutId,
          status: 'resolved',
          conflicts: findWorkoutLimitationConflicts(detail, completion?.limitations ?? null),
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setLimitationState({ workoutId, status: 'resolved', conflicts: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [detail, workoutId]);

  if (workoutId === undefined || detail === undefined) {
    return {
      status: 'notFound',
      workoutId: workoutId ?? null,
      detail: null,
      conflicts: [],
    };
  }

  const isLoading = limitationState.workoutId !== workoutId || limitationState.status === 'loading';

  if (isLoading) {
    return {
      status: 'loading',
      workoutId,
      detail,
      conflicts: [],
    };
  }

  return {
    status: detail.accessTier === 'pro' ? 'locked' : 'ready',
    workoutId,
    detail,
    conflicts: limitationState.conflicts,
  };
}
