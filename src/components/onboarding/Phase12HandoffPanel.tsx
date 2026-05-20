import { Column, Heading, Text } from '@components/primitives';

type Phase12HandoffPanelProps = {
  headingId: string;
};

export function Phase12HandoffPanel({ headingId }: Phase12HandoffPanelProps): JSX.Element {
  return (
    <Column gap="lg" className="flex-1 justify-center">
      <Column gap="md" className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-motionly-primary/30 bg-motionly-primary/10 text-motionly-primary">
          <span className="text-h3" aria-hidden="true">
            3
          </span>
        </div>
        <Heading id={headingId} level={1}>
          First half complete.
        </Heading>
        <Text tone="muted" className="mx-auto max-w-md">
          Movement limitations and the camera tutorial are implemented in Phase 12. Your Phase 11
          selections are held in memory for this session only, so a full refresh may reset them.
        </Text>
      </Column>
    </Column>
  );
}
