import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  DashboardData,
  DashboardOnboardingSummary,
  DashboardStatItem,
} from '@/types/dashboard';
import {
  readHasOnboarded,
  readOnboardingCompletion,
  type OnboardingCompletionRecord,
} from '@platform/onboarding-storage';

export type UseDashboardDataResult = {
  data: DashboardData;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
};

const UNAVAILABLE_STATS: DashboardStatItem[] = [
  {
    id: 'workoutsCompleted',
    label: 'Workouts completed',
    status: 'unavailable',
    reason: 'workout-history-not-implemented',
    message: 'Not tracking yet',
  },
  {
    id: 'formScore',
    label: 'Form score',
    status: 'unavailable',
    reason: 'form-analysis-not-implemented',
    message: 'Starts after real form analysis',
  },
  {
    id: 'correctReps',
    label: 'Correct reps',
    status: 'unavailable',
    reason: 'rep-counting-not-implemented',
    message: 'Starts after rep counting',
  },
  {
    id: 'streak',
    label: 'Streak',
    status: 'unavailable',
    reason: 'workout-history-not-implemented',
    message: 'Starts after workout history',
  },
];

function onboardingSummaryFrom(
  completion: OnboardingCompletionRecord | null,
): DashboardOnboardingSummary {
  if (completion === null) {
    return { status: 'empty', reason: 'onboarding-completion-missing' };
  }
  return {
    status: 'available',
    completedAt: completion.completedAt,
    goals: completion.goals,
    fitnessLevel: completion.fitnessLevel,
    limitations: completion.limitations,
    limitationNotes: completion.limitationNotes,
    cameraPermissionGranted: completion.cameraPermissionGranted,
  };
}

function buildDashboardData(completion: OnboardingCompletionRecord | null): DashboardData {
  return {
    onboardingSummary: onboardingSummaryFrom(completion),
    todayWorkout: { status: 'unavailable', reason: 'workout-library-not-implemented' },
    stats: {
      status: 'unavailable',
      reason: 'workout-history-not-implemented',
      items: UNAVAILABLE_STATS,
    },
    recentActivity: { status: 'unavailable', reason: 'workout-history-not-implemented' },
    subscription: {
      status: 'unavailable',
      reason: 'subscription-state-not-implemented',
      shouldShowUpgradeBanner: false,
    },
  };
}

async function readDashboardData(): Promise<DashboardData> {
  const [hasOnboarded, completion] = await Promise.all([
    readHasOnboarded(),
    readOnboardingCompletion(),
  ]);
  if (completion === null && hasOnboarded === true) {
    return {
      onboardingSummary: { status: 'unavailable', reason: 'onboarding-storage-unavailable' },
      todayWorkout: { status: 'unavailable', reason: 'workout-library-not-implemented' },
      stats: {
        status: 'unavailable',
        reason: 'workout-history-not-implemented',
        items: UNAVAILABLE_STATS,
      },
      recentActivity: { status: 'unavailable', reason: 'workout-history-not-implemented' },
      subscription: {
        status: 'unavailable',
        reason: 'subscription-state-not-implemented',
        shouldShowUpgradeBanner: false,
      },
    };
  }
  return buildDashboardData(completion);
}

export function useDashboardData(): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData>(() => buildDashboardData(null));
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setIsLoading(true);
      try {
        const nextData = await readDashboardData();
        if (cancelled === true) {
          return;
        }
        setData(nextData);
      } catch {
        if (cancelled === true) {
          return;
        }
        setData(buildDashboardData(null));
      } finally {
        if (cancelled === false) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      try {
        const nextData = await readDashboardData();
        if (isMountedRef.current === true) {
          setData(nextData);
        }
      } catch {
        if (isMountedRef.current === true) {
          setData(buildDashboardData(null));
        }
      }
    } finally {
      if (isMountedRef.current === true) {
        setIsRefreshing(false);
      }
    }
  }, []);

  return { data, isLoading, isRefreshing, refresh };
}
