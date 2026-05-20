import { useCallback } from 'react';

import { Button, Card, Chip, Column, Row, Text } from '@components/primitives';
import { useToast } from '@components/feedback';
import { POSE_LANDMARK_NAMES } from '@ml/pose/landmark-names';
import type {
  BodyVisibilityStatus,
  PoseDelegate,
  PoseFrame,
  PoseInferenceError,
  PoseInferenceStats,
  PoseInferenceStatus,
  PoseModelVariant,
  PoseProcessingConfig,
  PoseProcessingStats,
  PoseVisibilityReport,
  ProcessedPoseFrame,
} from '@/types/pose';

import { PoseFpsBadge } from './PoseFpsBadge';
import { PoseLandmarkStatus } from './PoseLandmarkStatus';
import { PoseModelStatusCard } from './PoseModelStatusCard';
import { PoseProcessingStatsCard } from './PoseProcessingStatsCard';
import { PoseProcessingStatusCard } from './PoseProcessingStatusCard';
import { PoseVisibilityCard } from './PoseVisibilityCard';
import type { PoseOverlayMode } from './PoseLandmarkOverlay';

type PoseDebugPanelProps = {
  status: PoseInferenceStatus;
  stats: PoseInferenceStats;
  latestFrame: PoseFrame | null;
  latestProcessedFrame: ProcessedPoseFrame | null;
  processingStats: PoseProcessingStats;
  visibilityReport: PoseVisibilityReport;
  bodyVisibilityStatus: BodyVisibilityStatus;
  processingConfig: PoseProcessingConfig;
  error: PoseInferenceError | null;
  modelVariant: PoseModelVariant | null;
  delegate: PoseDelegate | null;
  overlayEnabled: boolean;
  overlayMode: PoseOverlayMode;
  onToggleOverlay: () => void;
  onChangeOverlayMode: (mode: PoseOverlayMode) => void;
};

const OVERLAY_MODE_OPTIONS: ReadonlyArray<{ mode: PoseOverlayMode; label: string }> = [
  { mode: 'raw', label: 'Raw landmarks' },
  { mode: 'smoothed', label: 'Smoothed landmarks' },
  { mode: 'normalized', label: 'Normalized (debug)' },
];

/**
 * Phase 17 + 18 — composite debug panel for the active-workout pose surface.
 *
 * Surfaces everything Phase 17 and Phase 18 promise and nothing they
 * do not:
 * - real status from the MediaPipe wrapper
 * - real raw + processed landmark counts for the current frame
 * - real FPS / inference timing
 * - real Phase 18 visibility report (key landmark detail + mean score)
 * - real Phase 18 processing-overhead breakdown (smoothing, filtering,
 *   normalization, total)
 * - normalization status with the failure reason from the normalizer
 * - real model + delegate state
 * - a debug-only "Log current landmarks" button (no per-frame spam)
 * - an overlay toggle + overlay mode chips
 *
 * It does **not** display rep counts, form scores, calories, cues,
 * "AI feedback," or anything derived from data Motionly has not yet
 * computed.
 */
export function PoseDebugPanel({
  status,
  stats,
  latestFrame,
  latestProcessedFrame,
  processingStats,
  visibilityReport,
  bodyVisibilityStatus,
  processingConfig,
  error,
  modelVariant,
  delegate,
  overlayEnabled,
  overlayMode,
  onToggleOverlay,
  onChangeOverlayMode,
}: PoseDebugPanelProps): JSX.Element {
  const toast = useToast();
  const rawLandmarkCount = latestFrame?.landmarks.length ?? 0;
  const processedLandmarkCount = latestProcessedFrame?.smoothedLandmarks.length ?? 0;
  const hasWorldLandmarks =
    latestFrame !== null &&
    latestFrame.worldLandmarks !== null &&
    latestFrame.worldLandmarks.length > 0;

  const handleLogLandmarks = useCallback((): void => {
    if (latestFrame === null || latestFrame.landmarks.length === 0) {
      toast.show({
        tone: 'info',
        title: 'No landmarks to log',
        message: 'Step into frame and wait for MediaPipe to detect a body.',
      });
      return;
    }

    const sample = latestFrame.landmarks.slice(0, 5).map((landmark, index) => ({
      index,
      name: POSE_LANDMARK_NAMES[index],
      x: Number(landmark.x.toFixed(3)),
      y: Number(landmark.y.toFixed(3)),
      z: Number(landmark.z.toFixed(3)),
      visibility: Number(landmark.visibility.toFixed(3)),
    }));

    const processedSample =
      latestProcessedFrame === null
        ? null
        : latestProcessedFrame.smoothedLandmarks.slice(0, 5).map((landmark, index) => ({
            index,
            name: POSE_LANDMARK_NAMES[index],
            smoothedX: Number(landmark.smoothedX.toFixed(3)),
            smoothedY: Number(landmark.smoothedY.toFixed(3)),
            smoothedZ: Number(landmark.smoothedZ.toFixed(3)),
            isVisible: landmark.isVisible,
          }));

    console.info('[motionly:pose] latest landmarks', {
      frameId: latestFrame.frameId,
      timestampMs: Math.round(latestFrame.timestampMs),
      totalLandmarks: latestFrame.landmarks.length,
      worldLandmarks:
        latestFrame.worldLandmarks === null ? null : latestFrame.worldLandmarks.length,
      firstFiveRaw: sample,
      firstFiveSmoothed: processedSample,
      visibility: latestProcessedFrame?.visibility ?? null,
      normalization: latestProcessedFrame?.normalization ?? null,
      processingStats: latestProcessedFrame?.stats ?? null,
    });

    toast.show({
      tone: 'success',
      title: 'Landmark snapshot logged',
      message: 'Open DevTools console to inspect the latest frame.',
    });
  }, [latestFrame, latestProcessedFrame, toast]);

  return (
    <Card variant="outlined" padding="lg" className="flex flex-col gap-4">
      <Column gap="xs">
        <Text variant="h3" as="h2">
          Pose debug
        </Text>
        <Text variant="caption" tone="muted">
          Phase 18 processes landmarks for stability before angle and rep logic. No reps, form
          scores, or coaching are generated yet. Raw MediaPipe landmarks now flow through smoothing,
          confidence filtering, and torso-scale normalization.
        </Text>
      </Column>

      <div className="grid gap-3 lg:grid-cols-2">
        <PoseLandmarkStatus
          status={status}
          landmarkCount={rawLandmarkCount}
          hasWorldLandmarks={hasWorldLandmarks}
        />
        <PoseModelStatusCard
          status={status}
          modelVariant={modelVariant}
          delegate={delegate}
          error={error}
        />
        <PoseProcessingStatusCard
          inferenceStatus={status}
          bodyVisibilityStatus={bodyVisibilityStatus}
          processedLandmarkCount={processedLandmarkCount}
          normalization={latestProcessedFrame?.normalization ?? null}
          processingConfig={processingConfig}
        />
        <PoseVisibilityCard
          report={visibilityReport}
          visibilityThreshold={processingConfig.landmarkVisibilityThreshold}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <PoseFpsBadge stats={stats} />
        <PoseProcessingStatsCard stats={processingStats} />
      </div>

      <Column gap="sm">
        <Text variant="label" tone="muted">
          Overlay mode
        </Text>
        <Row gap="sm" wrap>
          {OVERLAY_MODE_OPTIONS.map((option) => (
            <Chip
              key={option.mode}
              selected={overlayMode === option.mode}
              onClick={() => onChangeOverlayMode(option.mode)}
            >
              {option.label}
            </Chip>
          ))}
        </Row>
        <Text variant="caption" tone="muted">
          Smoothed overlay uses Phase 18 EMA output. Normalized overlay is a debug projection in
          torso-scale coordinates, not a camera-space skeleton.
        </Text>
      </Column>

      <Row gap="sm" wrap>
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleOverlay}
          aria-pressed={overlayEnabled}
        >
          {overlayEnabled ? 'Hide landmark overlay' : 'Show landmark overlay'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLogLandmarks}>
          Log current landmarks
        </Button>
      </Row>
    </Card>
  );
}
