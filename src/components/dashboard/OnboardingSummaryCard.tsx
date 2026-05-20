import { Camera, CircleOff, ShieldCheck, Target } from 'lucide-react';

import type { DashboardOnboardingSummary } from '@/types/dashboard';
import { Badge, Card, Column, Heading, Icon, Row, Tag, Text } from '@components/primitives';

type AvailableOnboardingSummary = Extract<DashboardOnboardingSummary, { status: 'available' }>;

type OnboardingSummaryCardProps = {
  summary: AvailableOnboardingSummary;
};

const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Lose weight',
  build_strength: 'Build strength',
  improve_mobility: 'Improve mobility',
  start_safely: 'Start exercising safely',
  fit_at_home: 'Get fit at home',
};

const FITNESS_LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner / Just starting',
  intermediate: 'Intermediate / Some experience',
  active: 'Active',
};

const LIMITATION_LABELS: Record<string, string> = {
  lower_back: 'Lower back',
  knees: 'Knees',
  shoulders: 'Shoulders',
  hips: 'Hips',
  ankles: 'Ankles',
  wrists: 'Wrists',
};

function formatStoredValue(value: string): string {
  const cleaned = value.replace(/[_-]+/g, ' ').trim();
  if (cleaned.length === 0) {
    return 'Stored selection';
  }
  return cleaned.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function labelFor(value: string, labels: Record<string, string>): string {
  return labels[value] ?? formatStoredValue(value);
}

function formatCompletionDate(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function limitationLabelsFor(limitations: string[]): string[] {
  const specificLimitations = limitations.filter((limitation) => limitation !== 'none');
  if (specificLimitations.length === 0 && limitations.includes('none')) {
    return ['None selected'];
  }
  if (specificLimitations.length === 0) {
    return ['No limitations stored'];
  }
  return specificLimitations.map((limitation) => labelFor(limitation, LIMITATION_LABELS));
}

function TagList({ labels }: { labels: string[] }): JSX.Element {
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label, index) => (
        <Tag key={`${label}-${index}`} selected>
          {label}
        </Tag>
      ))}
    </div>
  );
}

export function OnboardingSummaryCard({ summary }: OnboardingSummaryCardProps): JSX.Element {
  const completedDate = formatCompletionDate(summary.completedAt);
  const goalLabels = summary.goals.map((goal) => labelFor(goal, GOAL_LABELS));
  const fitnessLevelLabel =
    summary.fitnessLevel === null
      ? 'No fitness level stored'
      : labelFor(summary.fitnessLevel, FITNESS_LEVEL_LABELS);
  const limitationLabels = limitationLabelsFor(summary.limitations);

  return (
    <Card as="section" variant="default" padding="lg" aria-labelledby="setup-summary-heading">
      <Column gap="lg">
        <Row align="start" justify="between" gap="md">
          <Column gap="sm">
            <Badge variant="accent">Onboarding complete</Badge>
            <Heading id="setup-summary-heading" level={2}>
              Your setup
            </Heading>
            <Text tone="muted">
              Saved locally from onboarding. These answers are not workout recommendations yet.
            </Text>
          </Column>
          <span className="rounded-2xl bg-motionly-accent/10 p-3 text-motionly-accent">
            <Icon icon={ShieldCheck} size="lg" />
          </span>
        </Row>

        {completedDate ? (
          <Text variant="caption" tone="subtle">
            Completed {completedDate}
          </Text>
        ) : null}

        <Column gap="md">
          <Column gap="sm">
            <Row gap="sm">
              <Icon icon={Target} size="sm" tone="muted" />
              <Text as="h3" variant="label">
                Goals selected
              </Text>
            </Row>
            {goalLabels.length > 0 ? (
              <TagList labels={goalLabels} />
            ) : (
              <Text tone="muted">No goals stored.</Text>
            )}
          </Column>

          <Column gap="sm">
            <Text as="h3" variant="label">
              Fitness level
            </Text>
            <Tag selected={summary.fitnessLevel !== null}>{fitnessLevelLabel}</Tag>
          </Column>

          <Column gap="sm">
            <Text as="h3" variant="label">
              Movement preferences
            </Text>
            <TagList labels={limitationLabels} />
          </Column>

          <Column gap="sm">
            <Text as="h3" variant="label">
              Camera permission
            </Text>
            <Badge variant={summary.cameraPermissionGranted ? 'accent' : 'neutral'}>
              <Icon icon={summary.cameraPermissionGranted ? Camera : CircleOff} size="sm" />
              {summary.cameraPermissionGranted ? 'Allowed during onboarding' : 'Skipped for now'}
            </Badge>
          </Column>
        </Column>
      </Column>
    </Card>
  );
}
