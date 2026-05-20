import { useCallback } from 'react';

import { Button, Card, Column, Row, Text } from '@components/primitives';
import { useToast } from '@components/feedback';
import type { AngleCalculationStats, AngleSnapshot } from '@/types/angles';

import { AngleAvailabilityCard } from './AngleAvailabilityCard';
import { AngleStatsCard } from './AngleStatsCard';
import { JointAngleGrid } from './JointAngleGrid';

/**
 * Phase 19 — composite angle debug surface.
 *
 * Surfaces only what Phase 19 actually computes:
 * - the latest `AngleSnapshot` (named joint angles + metrics),
 * - the structured availability report,
 * - the per-frame angle calculation overhead and history size,
 * - a debug-only "Log current angle snapshot" button.
 *
 * It deliberately does **not** display rep counts, form scores, calories,
 * coaching cues, or "good vs bad" classifications. Angles are reported
 * raw and unclassified until Phase 20+ form rules land.
 */

type AngleDebugPanelProps = {
  snapshot: AngleSnapshot | null;
  stats: AngleCalculationStats;
};

export function AngleDebugPanel({ snapshot, stats }: AngleDebugPanelProps): JSX.Element {
  const toast = useToast();

  const handleLogSnapshot = useCallback((): void => {
    if (snapshot === null) {
      toast.show({
        tone: 'info',
        title: 'No angle snapshot yet',
        message: 'Start pose debug and step into frame so Phase 19 can compute angles.',
      });
      return;
    }

    console.info('[motionly:angles] latest snapshot', {
      frameId: snapshot.frameId,
      timestampMs: Math.round(snapshot.timestampMs),
      availability: snapshot.availability,
      angles: {
        leftKnee: snapshot.leftKnee,
        rightKnee: snapshot.rightKnee,
        leftHip: snapshot.leftHip,
        rightHip: snapshot.rightHip,
        leftAnkle: snapshot.leftAnkle,
        rightAnkle: snapshot.rightAnkle,
        leftElbow: snapshot.leftElbow,
        rightElbow: snapshot.rightElbow,
        leftShoulder: snapshot.leftShoulder,
        rightShoulder: snapshot.rightShoulder,
        trunkAngle: snapshot.trunkAngle,
      },
      metrics: {
        leftKneeValgusRatio: snapshot.leftKneeValgusRatio,
        rightKneeValgusRatio: snapshot.rightKneeValgusRatio,
        hipSymmetryDelta: snapshot.hipSymmetryDelta,
      },
      stats,
    });

    toast.show({
      tone: 'success',
      title: 'Angle snapshot logged',
      message: 'Open DevTools console to inspect the latest joint angles.',
    });
  }, [snapshot, stats, toast]);

  return (
    <Card variant="outlined" padding="lg" className="flex flex-col gap-4">
      <Column gap="xs">
        <Text variant="h3" as="h2">
          Angle debug
        </Text>
        <Text variant="caption" tone="muted">
          Phase 19 calculates joint angles only. Rep counting and form scoring arrive later. Values
          come from the Phase 18 processed frame; unavailable angles list a reason instead of a
          fabricated number.
        </Text>
      </Column>

      <div className="grid gap-3 lg:grid-cols-2">
        <AngleStatsCard stats={stats} />
        <AngleAvailabilityCard snapshot={snapshot} />
      </div>

      <JointAngleGrid snapshot={snapshot} />

      <Row gap="sm" wrap>
        <Button variant="ghost" size="sm" onClick={handleLogSnapshot}>
          Log current angle snapshot
        </Button>
      </Row>
    </Card>
  );
}
