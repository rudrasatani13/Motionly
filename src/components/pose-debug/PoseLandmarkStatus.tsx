import { Card, Text } from '@components/primitives';
import type { PoseInferenceStatus } from '@/types/pose';

/**
 * Phase 17 — readable status pill for the pose-debug surface.
 *
 * Each status maps to one of the honest values returned by the
 * MediaPipe wrapper: idle, loading-model, ready, running, no-pose,
 * error. The component never fabricates a status; it shows whatever
 * the inference loop reported.
 */

type PoseLandmarkStatusProps = {
  status: PoseInferenceStatus;
  landmarkCount: number;
  hasWorldLandmarks: boolean;
};

const STATUS_COPY: Record<
  PoseInferenceStatus,
  {
    label: string;
    description: string;
    tone: 'default' | 'muted' | 'warning' | 'danger' | 'primary';
  }
> = {
  idle: {
    label: 'Idle',
    description: 'Start pose debug to load the model and begin inference.',
    tone: 'muted',
  },
  'loading-model': {
    label: 'Loading model…',
    description: 'Downloading the MediaPipe Pose Landmarker file.',
    tone: 'muted',
  },
  ready: {
    label: 'Ready',
    description: 'Model loaded. Waiting for the first inference frame.',
    tone: 'primary',
  },
  running: {
    label: 'Running',
    description: 'Receiving live landmarks from MediaPipe.',
    tone: 'primary',
  },
  'no-pose': {
    label: 'No pose detected',
    description: 'Step into frame so MediaPipe can see your full body.',
    tone: 'warning',
  },
  error: {
    label: 'Error',
    description: 'See the model card below for details.',
    tone: 'danger',
  },
};

export function PoseLandmarkStatus({
  status,
  landmarkCount,
  hasWorldLandmarks,
}: PoseLandmarkStatusProps): JSX.Element {
  const copy = STATUS_COPY[status];

  return (
    <Card
      variant="outlined"
      padding="md"
      role="status"
      aria-live="polite"
      className="flex flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-3">
        <Text variant="label" tone="muted">
          Pose status
        </Text>
        <Text variant="label" tone={copy.tone === 'default' ? 'default' : copy.tone}>
          {copy.label}
        </Text>
      </div>
      <Text variant="caption" tone="muted">
        {copy.description}
      </Text>
      <div className="flex items-center justify-between gap-3 pt-1">
        <Text variant="caption" tone="muted">
          Landmarks this frame
        </Text>
        <Text variant="label" tone={landmarkCount === 33 ? 'primary' : 'muted'}>
          {landmarkCount} / 33
        </Text>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Text variant="caption" tone="muted">
          World landmarks
        </Text>
        <Text variant="label" tone={hasWorldLandmarks ? 'primary' : 'muted'}>
          {hasWorldLandmarks ? 'present' : 'not reported'}
        </Text>
      </div>
    </Card>
  );
}
