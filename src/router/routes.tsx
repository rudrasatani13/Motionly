import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';

import { AuthLayout } from '@router/layouts/AuthLayout';
import { MainLayout } from '@router/layouts/MainLayout';
import { RequireAuth } from '@router/RequireAuth';
import { ROUTE_PATHS } from '@router/routePaths';
import { RouteLoadingFallback } from '@router/RouteLoadingFallback';

/**
 * Centralized route table.
 *
 * Every route module is loaded via `React.lazy` so the initial bundle stays
 * lean (Phase 6 success criterion: keep route-level code splitting in place).
 * The lazy default exports are unwrapped through a small `lazyRoute` helper
 * so we can render them through Suspense without repeating the wiring.
 *
 * Auth routes use `<AuthLayout>` and are NOT wrapped in `<RequireAuth>`.
 * Main routes use `<MainLayout>` (which renders the bottom tab bar) and are
 * wrapped in `<RequireAuth>` for structural symmetry — Phase 6 has no real
 * auth, see `RequireAuth.tsx` for the contract.
 */

const WelcomePage = lazy(() => import('@pages/auth/WelcomePage'));
const OnboardingPage = lazy(() => import('@pages/auth/OnboardingPage'));
const LoginPage = lazy(() => import('@pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@pages/auth/RegisterPage'));

const DashboardPage = lazy(() => import('@pages/main/DashboardPage'));
const WorkoutLibraryPage = lazy(() => import('@pages/workout/WorkoutLibraryPage'));
const WorkoutDetailPage = lazy(() => import('@pages/workout/WorkoutDetailPage'));
const CameraSetupPage = lazy(() => import('@pages/workout/CameraSetupPage'));
const ActiveWorkoutPage = lazy(() => import('@pages/workout/ActiveWorkoutPage'));
const WorkoutSummaryPage = lazy(() => import('@pages/workout/WorkoutSummaryPage'));
const ProgressPage = lazy(() => import('@pages/progress/ProgressPage'));
const ProfilePage = lazy(() => import('@pages/profile/ProfilePage'));

const PaywallPage = lazy(() => import('@pages/modal/PaywallPage'));
const PermissionsPage = lazy(() => import('@pages/modal/PermissionsPage'));

const NotFoundPage = lazy(() => import('@pages/system/NotFoundPage'));

function suspend(node: JSX.Element): JSX.Element {
  return <Suspense fallback={<RouteLoadingFallback />}>{node}</Suspense>;
}

function protectedNode(node: JSX.Element): JSX.Element {
  return <RequireAuth>{suspend(node)}</RequireAuth>;
}

export const routes: RouteObject[] = [
  // Auth + modal-style routes share a minimal layout
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTE_PATHS.welcome, element: suspend(<WelcomePage />) },
      { path: ROUTE_PATHS.onboarding, element: suspend(<OnboardingPage />) },
      { path: ROUTE_PATHS.login, element: suspend(<LoginPage />) },
      { path: ROUTE_PATHS.register, element: suspend(<RegisterPage />) },
      { path: ROUTE_PATHS.paywall, element: suspend(<PaywallPage />) },
      { path: ROUTE_PATHS.permissions, element: suspend(<PermissionsPage />) },
    ],
  },

  // Main protected routes share the bottom-tab layout
  {
    element: <MainLayout />,
    children: [
      { path: ROUTE_PATHS.home, element: protectedNode(<DashboardPage />) },
      { path: ROUTE_PATHS.workouts, element: protectedNode(<WorkoutLibraryPage />) },
      { path: ROUTE_PATHS.workoutDetail, element: protectedNode(<WorkoutDetailPage />) },
      { path: ROUTE_PATHS.workoutSetup, element: protectedNode(<CameraSetupPage />) },
      { path: ROUTE_PATHS.workoutActive, element: protectedNode(<ActiveWorkoutPage />) },
      { path: ROUTE_PATHS.workoutSummary, element: protectedNode(<WorkoutSummaryPage />) },
      { path: ROUTE_PATHS.progress, element: protectedNode(<ProgressPage />) },
      { path: ROUTE_PATHS.profile, element: protectedNode(<ProfilePage />) },
    ],
  },

  // 404 — keep it bare-layout so the layout cannot mask a routing bug
  { path: ROUTE_PATHS.notFound, element: suspend(<NotFoundPage />) },
];
