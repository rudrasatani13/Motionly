import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ROUTE_PATHS,
  buildWorkoutActivePath,
  buildWorkoutDetailPath,
  buildWorkoutSetupPath,
  buildWorkoutSummaryPath,
} from '@router/routePaths';

/**
 * Typed programmatic-navigation wrapper around `react-router-dom`.
 *
 * Use this hook instead of importing `useNavigate` or hardcoding URL strings.
 * Adding a navigation helper here once means every caller automatically picks
 * up the canonical path (and any future renames).
 *
 * Phase 6 establishes the surface; later phases extend it as new routes land.
 * IDs are accepted as parameters — never embed fake or hardcoded workout IDs.
 */
export type NavigationApi = {
  goHome: () => void;
  goToWelcome: () => void;
  goToOnboarding: () => void;
  goToLogin: () => void;
  goToRegister: () => void;
  goToWorkouts: () => void;
  goToWorkoutDetail: (workoutId: string) => void;
  goToWorkoutSetup: (workoutId: string) => void;
  goToWorkoutActive: (workoutId: string) => void;
  goToWorkoutSummary: (workoutId: string) => void;
  goToProgress: () => void;
  goToProfile: () => void;
  goToPaywall: () => void;
  goToPermissions: () => void;
  goBack: () => void;
};

export function useNavigation(): NavigationApi {
  const navigate = useNavigate();

  const goHome = useCallback((): void => {
    navigate(ROUTE_PATHS.home);
  }, [navigate]);

  const goToWelcome = useCallback((): void => {
    navigate(ROUTE_PATHS.welcome);
  }, [navigate]);

  const goToOnboarding = useCallback((): void => {
    navigate(ROUTE_PATHS.onboarding);
  }, [navigate]);

  const goToLogin = useCallback((): void => {
    navigate(ROUTE_PATHS.login);
  }, [navigate]);

  const goToRegister = useCallback((): void => {
    navigate(ROUTE_PATHS.register);
  }, [navigate]);

  const goToWorkouts = useCallback((): void => {
    navigate(ROUTE_PATHS.workouts);
  }, [navigate]);

  const goToWorkoutDetail = useCallback(
    (workoutId: string): void => {
      navigate(buildWorkoutDetailPath(workoutId));
    },
    [navigate],
  );

  const goToWorkoutSetup = useCallback(
    (workoutId: string): void => {
      navigate(buildWorkoutSetupPath(workoutId));
    },
    [navigate],
  );

  const goToWorkoutActive = useCallback(
    (workoutId: string): void => {
      navigate(buildWorkoutActivePath(workoutId));
    },
    [navigate],
  );

  const goToWorkoutSummary = useCallback(
    (workoutId: string): void => {
      navigate(buildWorkoutSummaryPath(workoutId));
    },
    [navigate],
  );

  const goToProgress = useCallback((): void => {
    navigate(ROUTE_PATHS.progress);
  }, [navigate]);

  const goToProfile = useCallback((): void => {
    navigate(ROUTE_PATHS.profile);
  }, [navigate]);

  const goToPaywall = useCallback((): void => {
    navigate(ROUTE_PATHS.paywall);
  }, [navigate]);

  const goToPermissions = useCallback((): void => {
    navigate(ROUTE_PATHS.permissions);
  }, [navigate]);

  const goBack = useCallback((): void => {
    navigate(-1);
  }, [navigate]);

  return {
    goHome,
    goToWelcome,
    goToOnboarding,
    goToLogin,
    goToRegister,
    goToWorkouts,
    goToWorkoutDetail,
    goToWorkoutSetup,
    goToWorkoutActive,
    goToWorkoutSummary,
    goToProgress,
    goToProfile,
    goToPaywall,
    goToPermissions,
    goBack,
  };
}
