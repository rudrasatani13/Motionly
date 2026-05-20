import { ArrowLeft, ArrowRight, CheckCircle2, FastForward } from 'lucide-react';

import type { CameraSetupReadinessStatus } from '@/types/camera-setup';
import { Button, Card, Column, Icon, Text } from '@components/primitives';
import { cn } from '@utils/cn';

type CameraSetupActionsProps = {
  cameraActive: boolean;
  readinessStatus: CameraSetupReadinessStatus;
  userConfirmedAlignment: boolean;
  onToggleAlignment: () => void;
  onContinue: () => void;
  onBackToDetails: () => void;
  onSkipSetup: () => void;
};

function readinessMessage(status: CameraSetupReadinessStatus): string {
  switch (status) {
    case 'camera_needed':
      return 'Turn on the camera before the setup check can be ready.';
    case 'lighting_needs_attention':
      return 'Lighting needs to look okay, or you need to explicitly accept the preview.';
    case 'needs_user_confirmation':
      return 'Confirm your full body is inside the guide before continuing.';
    case 'ready':
      return 'Camera is on, lighting is okay, and you confirmed alignment.';
    case 'not_ready':
    default:
      return 'Complete the setup checks before continuing.';
  }
}

export function CameraSetupActions({
  cameraActive,
  readinessStatus,
  userConfirmedAlignment,
  onToggleAlignment,
  onContinue,
  onBackToDetails,
  onSkipSetup,
}: CameraSetupActionsProps): JSX.Element {
  const ready = readinessStatus === 'ready';

  return (
    <Card as="section" variant="elevated" padding="lg" aria-label="Camera setup actions">
      <Column gap="lg">
        {cameraActive ? (
          <Column gap="sm">
            <Text variant="label">Line yourself up with the guide</Text>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              aria-pressed={userConfirmedAlignment}
              leftIcon={userConfirmedAlignment ? <Icon icon={CheckCircle2} size="sm" /> : undefined}
              className={cn(
                userConfirmedAlignment &&
                  'border-motionly-accent bg-motionly-accent/10 text-motionly-accent hover:bg-motionly-accent/15 dark:border-motionly-accent dark:bg-motionly-accent/10',
              )}
              onClick={onToggleAlignment}
            >
              I&apos;m lined up
            </Button>
            <Text variant="caption" tone="muted">
              Pose detection starts in the next phase. For now, confirm that your full body is
              inside the guide.
            </Text>
          </Column>
        ) : null}

        <Column gap="sm">
          <Text id="setup-readiness-helper" variant="caption" tone={ready ? 'accent' : 'muted'}>
            {readinessMessage(readinessStatus)}
          </Text>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              haptic={ready}
              disabled={!ready}
              aria-describedby="setup-readiness-helper"
              rightIcon={<Icon icon={ArrowRight} size="sm" />}
              onClick={onContinue}
            >
              Continue to workout
            </Button>
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              leftIcon={<Icon icon={ArrowLeft} size="sm" />}
              onClick={onBackToDetails}
            >
              Back to workout details
            </Button>
          </div>
        </Column>

        <div className="rounded-2xl border border-motionly-neutral-200 p-4 dark:border-motionly-neutral-800">
          <Column gap="sm">
            <Text variant="label">Advanced path</Text>
            <Text variant="caption" tone="muted">
              You can continue, but later pose detection may ask you to adjust your position.
            </Text>
            <div>
              <Button
                variant="ghost"
                size="md"
                leftIcon={<Icon icon={FastForward} size="sm" />}
                onClick={onSkipSetup}
              >
                Continue without setup check
              </Button>
            </div>
          </Column>
        </div>
      </Column>
    </Card>
  );
}
