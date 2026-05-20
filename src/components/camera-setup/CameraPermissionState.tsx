import { Camera, ShieldCheck } from 'lucide-react';

import type { CameraStreamStatus } from '@/types/camera-setup';
import { Button, Card, Column, Icon, Row, Text } from '@components/primitives';

type CameraPermissionStateProps = {
  status: CameraStreamStatus;
  onTurnOnCamera: () => void;
};

export function CameraPermissionState({
  status,
  onTurnOnCamera,
}: CameraPermissionStateProps): JSX.Element {
  const requesting = status === 'requesting';

  return (
    <Card as="section" variant="elevated" padding="lg" aria-labelledby="camera-permission-title">
      <Column gap="lg">
        <Row align="start" gap="md">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-motionly-primary/10 text-motionly-primary">
            <Icon icon={Camera} tone="primary" />
          </div>
          <Column gap="xs" className="min-w-0">
            <Text id="camera-permission-title" variant="h2" as="h2">
              Turn on your camera when ready
            </Text>
            <Text tone="muted">
              We&apos;ll use the camera preview to help you line up before the workout. The prompt
              only appears after you tap the button.
            </Text>
          </Column>
        </Row>

        <ul className="grid gap-3 text-body text-motionly-neutral-700 dark:text-motionly-neutral-200">
          <li className="flex gap-2">
            <Icon icon={ShieldCheck} tone="accent" size="sm" className="mt-1" />
            <span>Your video stays on this device.</span>
          </li>
          <li className="flex gap-2">
            <Icon icon={ShieldCheck} tone="accent" size="sm" className="mt-1" />
            <span>Motionly does not upload or store your camera feed.</span>
          </li>
          <li className="flex gap-2">
            <Icon icon={ShieldCheck} tone="accent" size="sm" className="mt-1" />
            <span>No microphone or audio permission is requested.</span>
          </li>
        </ul>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          haptic
          loading={requesting}
          loadingLabel="Requesting camera"
          onClick={onTurnOnCamera}
        >
          Turn on camera
        </Button>
      </Column>
    </Card>
  );
}
