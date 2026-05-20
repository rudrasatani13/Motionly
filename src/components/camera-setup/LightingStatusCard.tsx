import { AlertTriangle, CheckCircle2, Lightbulb, Loader2, SunMedium } from 'lucide-react';

import type { LightingStatus } from '@/types/camera-setup';
import { Badge, Button, Card, Column, Icon, Row, Text } from '@components/primitives';

type LightingStatusCardProps = {
  status: LightingStatus;
  averageBrightness: number | null;
  errorMessage: string | null;
  manuallyAccepted: boolean;
  canManuallyAccept: boolean;
  onManualAccept: () => void;
};

type LightingContent = {
  title: string;
  description: string;
  badge: string;
  badgeVariant: 'neutral' | 'accent' | 'warning' | 'danger';
  icon: typeof CheckCircle2;
  iconTone: 'muted' | 'accent' | 'warning' | 'danger';
};

function contentFor(status: LightingStatus, errorMessage: string | null): LightingContent {
  switch (status) {
    case 'good':
      return {
        title: 'Lighting looks okay',
        description: 'The local brightness check is in a comfortable range.',
        badge: 'Lighting okay',
        badgeVariant: 'accent',
        icon: CheckCircle2,
        iconTone: 'accent',
      };
    case 'too_dark':
      return {
        title: 'Try moving to a brighter area',
        description: 'Add light from the front or side so the preview is easier to see.',
        badge: 'Too dark',
        badgeVariant: 'warning',
        icon: Lightbulb,
        iconTone: 'warning',
      };
    case 'too_bright':
      return {
        title: 'Move away from bright windows behind you',
        description: 'Strong backlight can wash out the preview. Face the light when possible.',
        badge: 'Too bright',
        badgeVariant: 'warning',
        icon: SunMedium,
        iconTone: 'warning',
      };
    case 'error':
      return {
        title: "We couldn't read lighting",
        description:
          errorMessage ?? 'You can still continue if the preview looks clear enough to you.',
        badge: 'Manual check available',
        badgeVariant: 'warning',
        icon: AlertTriangle,
        iconTone: 'warning',
      };
    case 'checking':
      return {
        title: 'Checking lighting...',
        description: 'Motionly is sampling the live preview locally every half second.',
        badge: 'Checking',
        badgeVariant: 'neutral',
        icon: Loader2,
        iconTone: 'muted',
      };
    case 'unknown':
    default:
      return {
        title: 'Lighting check starts with the camera',
        description: 'Turn on the preview to check brightness from the live frame.',
        badge: 'Not checked',
        badgeVariant: 'neutral',
        icon: Lightbulb,
        iconTone: 'muted',
      };
  }
}

export function LightingStatusCard({
  status,
  averageBrightness,
  errorMessage,
  manuallyAccepted,
  canManuallyAccept,
  onManualAccept,
}: LightingStatusCardProps): JSX.Element {
  const content = contentFor(status, errorMessage);
  const IconComponent = content.icon;

  return (
    <Card as="section" variant="outlined" padding="lg" aria-labelledby="lighting-status-heading">
      <Column gap="md" role="status" aria-live="polite" aria-atomic="true">
        <Row align="start" justify="between" gap="md">
          <Row align="start" gap="sm" className="min-w-0">
            <Icon
              icon={IconComponent}
              tone={content.iconTone}
              className={
                status === 'checking' ? 'animate-spin motion-reduce:animate-none' : undefined
              }
            />
            <Column gap="xs" className="min-w-0">
              <Text id="lighting-status-heading" variant="h3" as="h2">
                {content.title}
              </Text>
              <Text tone="muted">{content.description}</Text>
            </Column>
          </Row>
          <Badge variant={manuallyAccepted ? 'accent' : content.badgeVariant}>
            {manuallyAccepted ? 'Accepted by you' : content.badge}
          </Badge>
        </Row>

        <Text variant="caption" tone="subtle">
          Local in-memory brightness check only. No frames are saved, uploaded, or recorded.
          {averageBrightness === null
            ? ''
            : ` Current brightness sample: ${Math.round(averageBrightness)}/255.`}
        </Text>

        {canManuallyAccept && !manuallyAccepted ? (
          <div>
            <Button variant="secondary" size="md" onClick={onManualAccept}>
              Looks clear enough
            </Button>
          </div>
        ) : null}
      </Column>
    </Card>
  );
}
