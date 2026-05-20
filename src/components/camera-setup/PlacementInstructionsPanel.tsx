import { useId, useState } from 'react';
import { ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';

import { Button, Card, Column, Icon, Row, Text } from '@components/primitives';

type PlacementInstructionsPanelProps = {
  speechSupported: boolean;
  onPlayVoiceInstruction: () => void;
};

const PLACEMENT_STEPS = [
  'Step back until your full body is visible',
  'Place phone at hip height facing you',
  'Keep your body inside the guide',
  'Use bright, even lighting',
  'Keep the phone steady',
] as const;

function PlacementDiagram(): JSX.Element {
  return (
    <svg
      viewBox="0 0 240 120"
      className="h-28 w-full rounded-2xl bg-motionly-neutral-100 text-motionly-neutral-500 dark:bg-motionly-neutral-950 dark:text-motionly-neutral-400"
      role="img"
      aria-label="Abstract phone facing a person at hip height"
    >
      <rect x="20" y="34" width="28" height="52" rx="6" fill="currentColor" opacity="0.25" />
      <circle cx="34" cy="76" r="2" fill="currentColor" />
      <path d="M56 60H130" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
      <circle cx="174" cy="30" r="13" fill="none" stroke="currentColor" strokeWidth="4" />
      <path
        d="M174 46c-20 0-33 18-33 42h66c0-24-13-42-33-42Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M156 88l-12 22M192 88l12 22" stroke="currentColor" strokeWidth="4" />
      <path d="M128 98h92" stroke="currentColor" strokeWidth="2" opacity="0.35" />
    </svg>
  );
}

export function PlacementInstructionsPanel({
  speechSupported,
  onPlayVoiceInstruction,
}: PlacementInstructionsPanelProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const reactId = useId();
  const contentId = `${reactId}-placement-instructions`;

  return (
    <Card as="section" variant="outlined" padding="lg" aria-labelledby="placement-heading">
      <Column gap="md">
        <Row align="center" justify="between" gap="md">
          <Column gap="xs" className="min-w-0">
            <Text id="placement-heading" variant="h3" as="h2">
              Placement instructions
            </Text>
            <Text tone="muted">Line yourself up with the guide before continuing.</Text>
          </Column>
          <Button
            variant="ghost"
            size="md"
            aria-expanded={expanded}
            aria-controls={contentId}
            rightIcon={<Icon icon={expanded ? ChevronUp : ChevronDown} size="sm" />}
            onClick={() => setExpanded((current) => !current)}
          >
            Tips
          </Button>
        </Row>

        {expanded ? (
          <Column id={contentId} gap="md" aria-label="Camera placement tips">
            <PlacementDiagram />
            <ul className="list-disc space-y-2 pl-6 text-body text-motionly-neutral-700 dark:text-motionly-neutral-200">
              {PLACEMENT_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </Column>
        ) : null}

        {speechSupported ? (
          <div>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Icon icon={Volume2} size="sm" />}
              onClick={onPlayVoiceInstruction}
              aria-label="Play setup instruction"
            >
              Play setup instruction
            </Button>
          </div>
        ) : (
          <Row align="center" gap="xs">
            <Icon icon={VolumeX} tone="subtle" size="sm" />
            <Text variant="caption" tone="subtle">
              Voice instruction unavailable on this browser.
            </Text>
          </Row>
        )}
      </Column>
    </Card>
  );
}
