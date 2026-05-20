import { Camera, ShieldCheck } from 'lucide-react';

import type { CameraStreamStatus } from '@/types/camera-setup';
import { Badge, Card, Column, Heading, Icon, Row, Text } from '@components/primitives';

type CameraSetupHeaderProps = {
  workoutName: string;
  streamStatus: CameraStreamStatus;
};

function statusLabel(status: CameraStreamStatus): string {
  switch (status) {
    case 'granted':
      return 'Camera is on';
    case 'requesting':
      return 'Requesting camera';
    case 'denied':
      return 'Camera blocked';
    case 'unavailable':
      return 'Camera unavailable';
    case 'error':
      return 'Camera needs attention';
    case 'idle':
    default:
      return 'Camera off';
  }
}

export function CameraSetupHeader({
  workoutName,
  streamStatus,
}: CameraSetupHeaderProps): JSX.Element {
  return (
    <header className="flex flex-col gap-4" aria-labelledby="camera-setup-heading">
      <Row align="center" justify="between" gap="md">
        <Badge variant={streamStatus === 'granted' ? 'accent' : 'neutral'}>
          {statusLabel(streamStatus)}
        </Badge>
        <Badge variant="primary">Setup</Badge>
      </Row>

      <Column gap="sm">
        <Heading id="camera-setup-heading" level={1}>
          Set up your camera
        </Heading>
        <Text tone="muted">
          {workoutName} starts after you line yourself up, check lighting, and continue to the
          active workout screen.
        </Text>
      </Column>

      <Card variant="outlined" padding="md" className="bg-motionly-primary/5">
        <Row align="start" gap="sm">
          <Icon icon={ShieldCheck} tone="primary" />
          <Column gap="xs" className="min-w-0">
            <Text variant="label">Your video stays on this device.</Text>
            <Text tone="muted">
              Motionly does not upload or store your camera feed. The preview is only used to help
              you set up before the workout.
            </Text>
          </Column>
          <Icon icon={Camera} tone="subtle" className="ml-auto hidden sm:block" />
        </Row>
      </Card>
    </header>
  );
}
