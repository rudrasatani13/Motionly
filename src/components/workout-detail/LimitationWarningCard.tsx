import { AlertTriangle, ArrowLeft } from 'lucide-react';

import type { WorkoutLimitationConflict } from '@/types/workout-library';
import { Button, Card, Column, Heading, Icon, Row, Text } from '@components/primitives';

type LimitationWarningCardProps = {
  conflicts: ReadonlyArray<WorkoutLimitationConflict>;
  onBackToLibrary?: () => void;
};

function joinList(values: ReadonlyArray<string>): string {
  if (values.length === 0) {
    return '';
  }
  if (values.length === 1) {
    return values[0] ?? '';
  }
  const last = values[values.length - 1] ?? '';
  return `${values.slice(0, -1).join(', ')} and ${last}`;
}

export function LimitationWarningCard({
  conflicts,
  onBackToLibrary,
}: LimitationWarningCardProps): JSX.Element | null {
  if (conflicts.length === 0) {
    return null;
  }

  const areaLabels = conflicts.map((conflict) => conflict.areaLabel);
  const movementTypes = conflicts.flatMap((conflict) => conflict.movementTypes);
  const uniqueMovementTypes = Array.from(new Set(movementTypes));

  return (
    <Card
      as="section"
      variant="outlined"
      padding="lg"
      role="status"
      aria-labelledby="limitation-warning-heading"
      className="border-motionly-warning/40 bg-motionly-warning/10"
    >
      <Column gap="md">
        <Row align="start" gap="sm">
          <Icon icon={AlertTriangle} tone="warning" />
          <Column gap="xs" className="min-w-0">
            <Heading id="limitation-warning-heading" level={2} className="text-h3">
              Heads up for your movement notes
            </Heading>
            <Text>
              This workout includes movements that may involve your {joinList(areaLabels)}.
            </Text>
          </Column>
        </Row>

        <Text tone="muted">
          Relevant movements: {joinList(uniqueMovementTypes)}. Move slowly, use a smaller range, and
          skip any movement that feels uncomfortable. You can choose another workout if needed.
        </Text>

        {onBackToLibrary ? (
          <div>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon icon={ArrowLeft} size="sm" />}
              onClick={onBackToLibrary}
            >
              Back to library
            </Button>
          </div>
        ) : null}
      </Column>
    </Card>
  );
}
