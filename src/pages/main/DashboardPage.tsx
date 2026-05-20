import {
  DashboardHeader,
  DashboardStatsGrid,
  OnboardingSummaryCard,
  QuickStartCard,
  RecentActivityCard,
  TodayWorkoutCard,
} from '@components/dashboard';
import { SkeletonLoader } from '@components/feedback';
import { Card } from '@components/primitives';
import { useDashboardData } from '@hooks/useDashboardData';
import { useNavigation } from '@hooks/useNavigation';

function DashboardContentSkeleton(): JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading dashboard data"
      className="flex flex-col gap-4"
    >
      <span className="sr-only">Loading dashboard data</span>
      <Card variant="elevated" padding="lg">
        <div className="flex flex-col gap-4">
          <SkeletonLoader shape="line" width="w-32" height="h-5" />
          <SkeletonLoader shape="line" lines={2} />
          <SkeletonLoader shape="block" height="h-12" />
        </div>
      </Card>
      <Card variant="outlined" padding="lg">
        <div className="flex flex-col gap-4">
          <SkeletonLoader shape="line" width="w-28" height="h-5" />
          <SkeletonLoader shape="line" lines={2} />
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} variant="outlined" padding="md">
            <div className="flex flex-col gap-3">
              <SkeletonLoader shape="line" width="w-28" />
              <SkeletonLoader shape="line" lines={2} />
            </div>
          </Card>
        ))}
      </div>
      <SkeletonLoader shape="card" height="h-44" />
    </div>
  );
}

export default function DashboardPage(): JSX.Element {
  const navigation = useNavigation();
  const { data, isLoading, isRefreshing, refresh } = useDashboardData();

  return (
    <section
      aria-labelledby="dashboard-heading"
      className="mx-auto flex w-full flex-col gap-6 px-4 pb-8 pt-6 sm:px-6 sm:pt-8"
    >
      <DashboardHeader
        isRefreshing={isRefreshing}
        refreshDisabled={isLoading}
        onRefresh={refresh}
      />

      {isLoading ? (
        <DashboardContentSkeleton />
      ) : (
        <>
          <TodayWorkoutCard state={data.todayWorkout} onExploreWorkouts={navigation.goToWorkouts} />
          <QuickStartCard onExploreWorkouts={navigation.goToWorkouts} />
          <DashboardStatsGrid state={data.stats} />
          <RecentActivityCard
            state={data.recentActivity}
            onViewProgress={navigation.goToProgress}
          />
          {data.onboardingSummary.status === 'available' ? (
            <OnboardingSummaryCard summary={data.onboardingSummary} />
          ) : null}
          {/* Upgrade banner intentionally waits for real subscription/free-tier state. */}
        </>
      )}
    </section>
  );
}
