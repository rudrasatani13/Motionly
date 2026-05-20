import { History } from 'lucide-react';

import type { DashboardRecentActivityState } from '@/types/dashboard';
import { EmptyState } from '@components/feedback';
import { Button, Card, Column, Heading, Icon, Row, Text } from '@components/primitives';

type RecentActivityCardProps = {
  state: DashboardRecentActivityState;
  onViewProgress: () => void;
};

function formatActivityDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function RecentActivityCard({
  state,
  onViewProgress,
}: RecentActivityCardProps): JSX.Element {
  const description = 'Completed workouts will appear here after the workout flow is implemented.';

  if (state.status === 'available') {
    return (
      <section aria-labelledby="recent-activity-heading">
        <Column gap="md">
          <Row align="start" justify="between" gap="md">
            <Column gap="xs">
              <Heading id="recent-activity-heading" level={2}>
                Recent activity
              </Heading>
              <Text tone="muted">Local workout history will appear here.</Text>
            </Column>
          </Row>
          <Column gap="sm">
            {state.items.map((item) => (
              <Card key={item.id} variant="outlined" padding="md">
                <Column gap="xs">
                  <Row align="center" justify="between" gap="sm">
                    <Text as="h3" variant="label">
                      {item.workoutName}
                    </Text>
                    <Text variant="caption" tone="subtle">
                      {formatActivityDate(item.completedAt)}
                    </Text>
                  </Row>
                  <Text tone="muted">
                    {[
                      item.durationMinutes !== null ? `${item.durationMinutes} min` : null,
                      item.formScore !== null ? `form ${item.formScore}` : null,
                    ]
                      .filter((part): part is string => part !== null)
                      .join(' · ')}
                  </Text>
                </Column>
              </Card>
            ))}
          </Column>
        </Column>
      </section>
    );
  }

  return (
    <section aria-label="Recent activity">
      <EmptyState
        title="Recent activity"
        description={description}
        headingAs="h2"
        illustration={<Icon icon={History} size="xl" />}
        action={
          <Button variant="secondary" onClick={onViewProgress}>
            View progress route
          </Button>
        }
      />
    </section>
  );
}
