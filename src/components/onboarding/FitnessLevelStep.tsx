import { Check, Circle } from 'lucide-react';

import type { FitnessLevel } from '@/types/onboarding';
import { Column, Heading, Icon, Text } from '@components/primitives';
import { cn } from '@utils/cn';

type FitnessLevelOption = {
  id: FitnessLevel;
  label: string;
  description: string;
};

const FITNESS_LEVEL_OPTIONS: FitnessLevelOption[] = [
  {
    id: 'beginner',
    label: 'Beginner / Just starting',
    description: "I'm new to working out.",
  },
  {
    id: 'intermediate',
    label: 'Intermediate / Some experience',
    description: 'I move 1-2 times a week.',
  },
  {
    id: 'active',
    label: 'Active',
    description: 'I move 3+ times a week.',
  },
];

type FitnessLevelStepProps = {
  headingId: string;
  selectedFitnessLevel: FitnessLevel | null;
  onSelectFitnessLevel: (level: FitnessLevel) => void;
};

export function FitnessLevelStep({
  headingId,
  selectedFitnessLevel,
  onSelectFitnessLevel,
}: FitnessLevelStepProps): JSX.Element {
  return (
    <Column gap="lg" className="flex-1">
      <Column gap="sm">
        <Heading id={headingId} level={1}>
          How active are you right now?
        </Heading>
        <Text tone="muted">Choose the starting point that feels most honest today.</Text>
      </Column>

      <Column gap="sm" role="radiogroup" aria-labelledby={headingId}>
        {FITNESS_LEVEL_OPTIONS.map((level) => {
          const isSelected = selectedFitnessLevel === level.id;
          return (
            <button
              key={level.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={cn(
                'flex min-h-20 w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-motionly-primary focus-visible:ring-offset-2 focus-visible:ring-offset-motionly-bg-light dark:focus-visible:ring-offset-motionly-bg-dark',
                isSelected
                  ? 'border-motionly-primary bg-motionly-primary/10 text-motionly-neutral-900 dark:text-motionly-neutral-50'
                  : 'border-motionly-neutral-200 bg-motionly-neutral-50 text-motionly-neutral-900 hover:bg-motionly-neutral-100 active:bg-motionly-neutral-200 dark:border-motionly-neutral-800 dark:bg-motionly-neutral-900 dark:text-motionly-neutral-50 dark:hover:bg-motionly-neutral-800 dark:active:bg-motionly-neutral-800',
              )}
              onClick={() => onSelectFitnessLevel(level.id)}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                  isSelected ? 'text-motionly-primary' : 'text-motionly-neutral-400',
                )}
                aria-hidden="true"
              >
                <Icon icon={isSelected ? Check : Circle} size="md" />
              </span>
              <span className="flex flex-1 flex-col gap-1">
                <Text as="span" variant="label" tone="inherit">
                  {level.label}
                </Text>
                <Text as="span" variant="caption" tone="muted">
                  {level.description}
                </Text>
              </span>
              {isSelected ? (
                <span className="rounded-full bg-motionly-primary px-2 py-1 text-caption font-medium text-white">
                  Selected
                </span>
              ) : null}
            </button>
          );
        })}
      </Column>
    </Column>
  );
}
