import { AlertTriangle, ArrowLeft, RefreshCw, Settings } from 'lucide-react';

import type { CameraSetupError } from '@/types/camera-setup';
import { Button, Card, Column, Heading, Icon, Row, Text } from '@components/primitives';

type CameraSetupErrorStateProps = {
  error: CameraSetupError;
  onRetry: () => void;
  onBackToDetails: () => void;
  onOpenPermissions: () => void;
};

function guidanceFor(error: CameraSetupError): ReadonlyArray<string> {
  switch (error.kind) {
    case 'permission-denied':
      return [
        'Use the browser permission icon near the address bar to allow Camera.',
        'Reload Motionly after changing browser settings if the prompt does not appear.',
      ];
    case 'insecure-context':
      return ['Open Motionly over HTTPS or localhost, then try again.'];
    case 'no-camera':
      return ['Connect or enable a camera for this browser, then try again.'];
    case 'camera-busy':
      return ['Close other camera apps, tabs, or video calls before retrying.'];
    case 'unsupported-browser':
      return ['Try a current version of Chrome, Edge, or Safari.'];
    case 'unreadable':
    case 'request-failed':
    default:
      return ['Check that your camera is available and try again.'];
  }
}

export function CameraSetupErrorState({
  error,
  onRetry,
  onBackToDetails,
  onOpenPermissions,
}: CameraSetupErrorStateProps): JSX.Element {
  return (
    <Card
      as="section"
      variant="outlined"
      padding="lg"
      role="alert"
      aria-labelledby="camera-setup-error-heading"
      className="border-motionly-warning/40 bg-motionly-warning/10"
    >
      <Column gap="lg">
        <Row align="start" gap="md">
          <Icon icon={AlertTriangle} tone="warning" />
          <Column gap="xs" className="min-w-0">
            <Heading id="camera-setup-error-heading" level={2} className="text-h3">
              Camera setup needs attention
            </Heading>
            <Text>{error.message}</Text>
            <Text tone="muted">Nothing was uploaded. Video stays on your device.</Text>
          </Column>
        </Row>

        <ul className="list-disc space-y-2 pl-6 text-body text-motionly-neutral-700 dark:text-motionly-neutral-200">
          {guidanceFor(error).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<Icon icon={RefreshCw} size="sm" />}
            onClick={onRetry}
          >
            Try again
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            leftIcon={<Icon icon={Settings} size="sm" />}
            onClick={onOpenPermissions}
          >
            Permissions help
          </Button>
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            leftIcon={<Icon icon={ArrowLeft} size="sm" />}
            onClick={onBackToDetails}
          >
            Back to details
          </Button>
        </div>
      </Column>
    </Card>
  );
}
