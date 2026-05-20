import type { LucideIcon } from 'lucide-react';
import { Activity, CalendarCheck, Flame, Repeat } from 'lucide-react';

import type { DashboardStatId, DashboardStatItem, DashboardStatsState } from '@/types/dashboard';
import { Badge, Card, Column, Heading, Icon, Row, Text } from '@components/primitives';

type DashboardStatsGridProps = {
  state: DashboardStatsState;
};

const STAT_ICONS: Record<DashboardStatId, LucideIcon> = {
  workoutsCompleted: CalendarCheck,
  formScore: Activity,
  correctReps: Repeat,
  streak: Flame,
};

function StatCard({ item }: { item: DashboardStatItem }): JSX.Element {
  const IconComponent = STAT_ICONS[item.id];

  return (
    <Card variant="outlined" padding="md" className="min-h-32">
      <Column gap="sm" className="h-full">
        <Row align="center" justify="between" gap="sm">
          <Text as="h3" variant="label" tone="default">
            {item.label}
          </Text>
          <Icon icon={IconComponent} size="md" tone="muted" />
        </Row>

        {item.status === 'available' ? (
          <Column gap="xs">
            <Text variant="h3" as="p">
              {item.value}
            </Text>
            {item.description ? (
              <Text variant="caption" tone="muted">
                {item.description}
              </Text>
            ) : null}
          </Column>
        ) : (
          <Text tone="muted" className="mt-auto">
            {item.message}
          </Text>
        )}
      </Column>
    </Card>
  );
}

export function DashboardStatsGrid({ state }: DashboardStatsGridProps): JSX.Element {
  const statusLabel = state.status === 'available' ? 'Live' : 'Unavailable for now';

  return (
    <section aria-labelledby="dashboard-stats-heading">
      <Column gap="md">
        <Row align="start" justify="between" gap="md">
          <Column gap="xs">
            <Heading id="dashboard-stats-heading" level={2}>
              Progress summary
            </Heading>
            <Text tone="muted">
              These cards stay empty until workouts, history, and analysis are real.
            </Text>
          </Column>
          <Badge variant="neutral">{statusLabel}</Badge>
        </Row>

        <div
          role="group"
          aria-label="Progress summary"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {state.items.map((item) => (
            <StatCard key={item.id} item={item} />
          ))}
        </div>
      </Column>
    </section>
  );
}
