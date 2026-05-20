import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';

import type { WorkoutAccessTier } from '@/types/workout-library';
import { Button, Card, Icon, Text } from '@components/primitives';

type PreWorkoutActionsProps = {
  accessTier: WorkoutAccessTier;
  onPrimaryAction: () => void;
  onBackToLibrary: () => void;
};

export function PreWorkoutActions({
  accessTier,
  onPrimaryAction,
  onBackToLibrary,
}: PreWorkoutActionsProps): JSX.Element {
  const locked = accessTier === 'pro';

  return (
    <Card as="section" variant="elevated" padding="lg" aria-label="Pre-workout actions">
      <div className="flex w-full flex-col gap-3">
        <Text tone="muted" variant="caption" className="text-center">
          {locked
            ? 'This Pro workout opens the paywall placeholder. Real subscription access arrives later.'
            : 'Camera setup is next. Starting here does not request camera permission or create a session.'}
        </Text>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <Button
            variant={locked ? 'secondary' : 'primary'}
            size="lg"
            fullWidth
            haptic={!locked}
            leftIcon={locked ? <Icon icon={Lock} size="sm" /> : undefined}
            rightIcon={!locked ? <Icon icon={ArrowRight} size="sm" /> : undefined}
            onClick={onPrimaryAction}
          >
            {locked ? 'View Pro access' : 'Start workout'}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            leftIcon={<Icon icon={ArrowLeft} size="sm" />}
            onClick={onBackToLibrary}
          >
            Back to library
          </Button>
        </div>
      </div>
    </Card>
  );
}
