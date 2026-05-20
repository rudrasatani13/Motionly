import { ShieldCheck, Sparkles } from 'lucide-react';

import { Card, Column, Heading, Icon, Row, Text } from '@components/primitives';

type CoachNoteCardProps = {
  note: string;
};

export function CoachNoteCard({ note }: CoachNoteCardProps): JSX.Element {
  return (
    <section aria-labelledby="coach-note-heading">
      <Column gap="sm">
        <Heading id="coach-note-heading" level={2} className="text-h3">
          {"Coach's note"}
        </Heading>
        <Card variant="default" padding="lg">
          <Column gap="md">
            <Row align="start" gap="sm">
              <Icon icon={Sparkles} tone="primary" />
              <Text>{note}</Text>
            </Row>
            <Row align="start" gap="sm">
              <Icon icon={ShieldCheck} tone="accent" />
              <Text tone="muted" variant="caption">
                Camera setup is next. Motionly is a movement coach, not medical care; stop if
                something hurts. This detail screen does not start the camera.
              </Text>
            </Row>
          </Column>
        </Card>
      </Column>
    </section>
  );
}
