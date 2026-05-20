import { AlertTriangle, CheckCircle2, Circle } from 'lucide-react';

import type { LightingStatus } from '@/types/camera-setup';
import { Card, Column, Icon, Row, Text } from '@components/primitives';

type ChecklistItemStatus = 'done' | 'pending' | 'attention';

type CameraSetupChecklistProps = {
  cameraActive: boolean;
  lightingStatus: LightingStatus;
  lightingAccepted: boolean;
  userConfirmedAlignment: boolean;
};

type ChecklistItem = {
  label: string;
  helper: string;
  status: ChecklistItemStatus;
};

function lightingItemStatus(
  lightingStatus: LightingStatus,
  lightingAccepted: boolean,
): ChecklistItemStatus {
  if (lightingAccepted || lightingStatus === 'good') {
    return 'done';
  }
  if (
    lightingStatus === 'too_dark' ||
    lightingStatus === 'too_bright' ||
    lightingStatus === 'error'
  ) {
    return 'attention';
  }
  return 'pending';
}

function itemIcon(status: ChecklistItemStatus): typeof CheckCircle2 {
  if (status === 'done') {
    return CheckCircle2;
  }
  if (status === 'attention') {
    return AlertTriangle;
  }
  return Circle;
}

function iconTone(status: ChecklistItemStatus): 'muted' | 'accent' | 'warning' {
  if (status === 'done') {
    return 'accent';
  }
  if (status === 'attention') {
    return 'warning';
  }
  return 'muted';
}

export function CameraSetupChecklist({
  cameraActive,
  lightingStatus,
  lightingAccepted,
  userConfirmedAlignment,
}: CameraSetupChecklistProps): JSX.Element {
  const items: ChecklistItem[] = [
    {
      label: 'Camera on',
      helper: cameraActive ? 'Live preview is available.' : 'Turn on camera to see the preview.',
      status: cameraActive ? 'done' : 'pending',
    },
    {
      label: 'Lighting okay',
      helper: lightingAccepted
        ? 'You explicitly confirmed the preview looks clear enough.'
        : lightingStatus === 'good'
          ? 'Brightness is in the local check range.'
          : 'Use the lighting card guidance before continuing.',
      status: lightingItemStatus(lightingStatus, lightingAccepted),
    },
    {
      label: 'Full body inside guide',
      helper: userConfirmedAlignment
        ? 'Confirmed by you.'
        : 'Tap "I\'m lined up" after your full body fits inside the guide.',
      status: userConfirmedAlignment ? 'done' : 'pending',
    },
    {
      label: 'Phone steady',
      helper: userConfirmedAlignment
        ? 'Manual reminder acknowledged; no steadiness sensor is running.'
        : 'Lean the phone against something stable before confirming.',
      status: userConfirmedAlignment ? 'done' : 'pending',
    },
  ];

  return (
    <Card as="section" variant="outlined" padding="lg" aria-labelledby="setup-checklist-heading">
      <Column gap="md">
        <Column gap="xs">
          <Text id="setup-checklist-heading" variant="h3" as="h2">
            Setup checklist
          </Text>
          <Text tone="muted">
            These are camera, lighting, and manual confirmation checks only. No body detection is
            running in this phase.
          </Text>
        </Column>

        <ul className="grid gap-3">
          {items.map((item) => {
            const IconComponent = itemIcon(item.status);
            return (
              <li key={item.label}>
                <Row align="start" gap="sm">
                  <Icon icon={IconComponent} tone={iconTone(item.status)} className="mt-0.5" />
                  <Column gap="xs" className="min-w-0">
                    <Text variant="label">{item.label}</Text>
                    <Text variant="caption" tone="muted">
                      {item.helper}
                    </Text>
                  </Column>
                </Row>
              </li>
            );
          })}
        </ul>
      </Column>
    </Card>
  );
}
