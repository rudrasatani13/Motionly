export type DashboardFeatureStatus = 'available' | 'empty' | 'unavailable';

export type DashboardUnavailableReason =
  | 'onboarding-completion-missing'
  | 'onboarding-storage-unavailable'
  | 'workout-library-not-implemented'
  | 'workout-history-not-implemented'
  | 'form-analysis-not-implemented'
  | 'rep-counting-not-implemented'
  | 'subscription-state-not-implemented';

export type DashboardOnboardingSummary =
  | {
      status: 'available';
      completedAt: string;
      goals: string[];
      fitnessLevel: string | null;
      limitations: string[];
      limitationNotes: string;
      cameraPermissionGranted: boolean;
    }
  | {
      status: 'empty';
      reason: 'onboarding-completion-missing';
    }
  | {
      status: 'unavailable';
      reason: 'onboarding-storage-unavailable';
    };

export type DashboardWorkoutSummaryState =
  | {
      status: 'available';
      workoutId: string;
      name: string;
      durationMinutes: number | null;
      exerciseCount: number | null;
      difficulty: string | null;
    }
  | {
      status: 'empty';
      reason: 'no-workout-selected';
    }
  | {
      status: 'unavailable';
      reason: 'workout-library-not-implemented';
    };

export type DashboardStatId = 'workoutsCompleted' | 'formScore' | 'correctReps' | 'streak';

export type DashboardStatItem =
  | {
      id: DashboardStatId;
      label: string;
      status: 'available';
      value: string;
      description?: string;
    }
  | {
      id: DashboardStatId;
      label: string;
      status: 'empty';
      message: string;
    }
  | {
      id: DashboardStatId;
      label: string;
      status: 'unavailable';
      reason: Extract<
        DashboardUnavailableReason,
        | 'workout-history-not-implemented'
        | 'form-analysis-not-implemented'
        | 'rep-counting-not-implemented'
      >;
      message: string;
    };

export type DashboardStatsState =
  | {
      status: 'available';
      items: DashboardStatItem[];
    }
  | {
      status: 'empty';
      reason: 'no-workout-history';
      items: DashboardStatItem[];
    }
  | {
      status: 'unavailable';
      reason: 'workout-history-not-implemented';
      items: DashboardStatItem[];
    };

export type DashboardRecentActivityItem = {
  id: string;
  workoutName: string;
  completedAt: string;
  durationMinutes: number | null;
  formScore: number | null;
};

export type DashboardRecentActivityState =
  | {
      status: 'available';
      items: DashboardRecentActivityItem[];
    }
  | {
      status: 'empty';
      reason: 'no-completed-workouts';
    }
  | {
      status: 'unavailable';
      reason: 'workout-history-not-implemented';
    };

export type DashboardSubscriptionTier = 'free' | 'pro';

export type DashboardSubscriptionState =
  | {
      status: 'available';
      tier: DashboardSubscriptionTier;
      shouldShowUpgradeBanner: boolean;
    }
  | {
      status: 'empty';
      reason: 'no-subscription-state';
      shouldShowUpgradeBanner: false;
    }
  | {
      status: 'unavailable';
      reason: 'subscription-state-not-implemented';
      shouldShowUpgradeBanner: false;
    };

export type DashboardData = {
  onboardingSummary: DashboardOnboardingSummary;
  todayWorkout: DashboardWorkoutSummaryState;
  stats: DashboardStatsState;
  recentActivity: DashboardRecentActivityState;
  subscription: DashboardSubscriptionState;
};
