import { Card, Column } from '@components/primitives';
import { SkeletonLoader } from '@components/feedback';

export function WorkoutDetailSkeleton(): JSX.Element {
  return (
    <section
      aria-label="Loading workout detail"
      aria-busy="true"
      className="mx-auto flex w-full flex-col gap-6 px-4 pb-8 pt-6 sm:px-6 sm:pt-8"
    >
      <SkeletonLoader shape="block" height="h-44" />
      <SkeletonLoader shape="line" width="w-3/4" height="h-8" />
      <SkeletonLoader shape="line" lines={2} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonLoader key={index} shape="block" height="h-24" />
        ))}
      </div>
      <Card variant="outlined" padding="lg">
        <Column gap="md">
          <SkeletonLoader shape="line" width="w-1/2" />
          <SkeletonLoader shape="line" lines={4} />
        </Column>
      </Card>
    </section>
  );
}
