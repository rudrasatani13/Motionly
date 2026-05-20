import { ArrowRight, Sparkles } from 'lucide-react';

import { Badge, Button, Card, Column, Heading, Icon, Row, Text } from '@components/primitives';

type QuickStartCardProps = {
  onExploreWorkouts: () => void;
};

export function QuickStartCard({ onExploreWorkouts }: QuickStartCardProps): JSX.Element {
  return (
    <Card as="section" variant="outlined" padding="lg" aria-labelledby="quick-start-heading">
      <Column gap="lg">
        <Row align="start" justify="between" gap="md">
          <Column gap="sm">
            <Badge variant="neutral">Coming after library</Badge>
            <Heading id="quick-start-heading" level={2}>
              Quick start
            </Heading>
          </Column>
          <span className="rounded-2xl bg-motionly-neutral-100 p-3 text-motionly-neutral-600 dark:bg-motionly-neutral-800 dark:text-motionly-neutral-300">
            <Icon icon={Sparkles} size="lg" />
          </span>
        </Row>

        <Text tone="muted">Quick start unlocks after the workout library is added.</Text>

        <Button
          variant="secondary"
          fullWidth
          rightIcon={<Icon icon={ArrowRight} size="sm" />}
          onClick={onExploreWorkouts}
        >
          Explore workouts
        </Button>
      </Column>
    </Card>
  );
}
