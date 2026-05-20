import { Badge, Column, Heading, Row, Text } from '@components/primitives';

import { DashboardRefreshControl } from './DashboardRefreshControl';

type DashboardHeaderProps = {
  isRefreshing: boolean;
  refreshDisabled?: boolean;
  onRefresh: () => void | Promise<void>;
};

function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function DashboardHeader({
  isRefreshing,
  refreshDisabled = false,
  onRefresh,
}: DashboardHeaderProps): JSX.Element {
  const now = new Date();

  return (
    <header className="flex flex-col gap-4">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Column gap="xs">
          <Text as="span" variant="label" tone="primary" className="uppercase tracking-[0.16em]">
            Home
          </Text>
          <Heading id="dashboard-heading" level={1}>
            {greetingFor(now)}
          </Heading>
          <Text tone="muted">{formatDate(now)}</Text>
        </Column>
        <DashboardRefreshControl
          isRefreshing={isRefreshing}
          disabled={refreshDisabled}
          onRefresh={onRefresh}
        />
      </div>
      <Row gap="sm" wrap>
        <Badge variant="primary">Ready when you are</Badge>
        <Badge variant="neutral">On-device coaching setup</Badge>
      </Row>
    </header>
  );
}
