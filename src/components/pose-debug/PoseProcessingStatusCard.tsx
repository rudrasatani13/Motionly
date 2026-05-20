import { Card, Text } from '@components/primitives';
import type {
  BodyVisibilityStatus,
  PoseInferenceStatus,
  PoseNormalizationMetadata,
  PoseProcessingConfig,
} from '@/types/pose';

/**
 * Phase 18 — readable status card for the processed-landmark pipeline.
 *
 * Shows the honest summary of what the Phase 18 processor produced for
 * the current frame: how many processed landmarks were emitted,
 * whether normalization succeeded, the active smoothing alpha, and the
 * coarse body-visibility status derived from real MediaPipe values.
 *
 * It never fabricates "body detected" or invents a normalized result —
 * a failed normalization is labelled with the reason the normalizer
 * returned.
 */

type PoseProcessingStatusCardProps = {
  inferenceStatus: PoseInferenceStatus;
  bodyVisibilityStatus: BodyVisibilityStatus;
  processedLandmarkCount: number;
  normalization: PoseNormalizationMetadata | null;
  processingConfig: PoseProcessingConfig;
};

const BODY_STATUS_COPY: Record<
  BodyVisibilityStatus,
  { label: string; tone: 'default' | 'muted' | 'warning' | 'danger' | 'primary' }
> = {
  unknown: { label: 'Unknown', tone: 'muted' },
  'no-pose': { label: 'No pose detected', tone: 'warning' },
  partial: { label: 'Partially visible', tone: 'warning' },
  'fully-visible': { label: 'Fully visible', tone: 'primary' },
};

function describeNormalization(meta: PoseNormalizationMetadata | null): {
  label: string;
  tone: 'default' | 'muted' | 'warning' | 'danger' | 'primary';
  detail: string | null;
} {
  if (meta === null) {
    return {
      label: 'Not run',
      tone: 'muted',
      detail: 'Normalization runs once landmarks are detected.',
    };
  }
  if (meta.normalized) {
    return {
      label: 'Normalized',
      tone: 'primary',
      detail: `Torso scale ${meta.torsoScale.toFixed(3)} (hip-to-shoulder, normalized image space)`,
    };
  }
  switch (meta.reason) {
    case 'no-landmarks':
      return {
        label: 'Not normalized',
        tone: 'muted',
        detail: 'No processed landmarks to normalize this frame.',
      };
    case 'key-landmarks-occluded':
      return {
        label: 'Not normalized',
        tone: 'warning',
        detail: 'Shoulders or hips were not visible enough this frame.',
      };
    case 'invalid-torso-scale':
      return {
        label: 'Not normalized',
        tone: 'warning',
        detail: 'Torso scale fell below the safe minimum (subject too far or angled).',
      };
    case 'numeric-instability':
    default:
      return {
        label: 'Not normalized',
        tone: 'danger',
        detail: 'A non-finite value blocked normalization for this frame.',
      };
  }
}

export function PoseProcessingStatusCard({
  inferenceStatus,
  bodyVisibilityStatus,
  processedLandmarkCount,
  normalization,
  processingConfig,
}: PoseProcessingStatusCardProps): JSX.Element {
  const bodyCopy = BODY_STATUS_COPY[bodyVisibilityStatus];
  const normalizationCopy = describeNormalization(normalization);
  const isIdle = inferenceStatus === 'idle' || inferenceStatus === 'loading-model';

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
          Processed pose
        </Text>
        <Text variant="label" tone={isIdle ? 'muted' : bodyCopy.tone}>
          {isIdle ? 'Waiting for first frame' : bodyCopy.label}
        </Text>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Text variant="caption" tone="muted">
          Processed landmarks
        </Text>
        <Text variant="label" tone={processedLandmarkCount === 33 ? 'primary' : 'muted'}>
          {processedLandmarkCount} / 33
        </Text>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Text variant="caption" tone="muted">
          Smoothing α
        </Text>
        <Text variant="label">{processingConfig.smoothingAlpha.toFixed(2)}</Text>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Text variant="caption" tone="muted">
          Normalization
        </Text>
        <Text variant="label" tone={normalizationCopy.tone}>
          {normalizationCopy.label}
        </Text>
      </div>
      {normalizationCopy.detail !== null ? (
        <Text variant="caption" tone="muted">
          {normalizationCopy.detail}
        </Text>
      ) : null}

      <Text variant="caption" tone="muted">
        Phase 18 processes landmarks for stability before angle and rep logic. No reps, form scores,
        or coaching are generated yet.
      </Text>
    </Card>
  );
}
