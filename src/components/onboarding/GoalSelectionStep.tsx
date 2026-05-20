import { Check, Circle } from 'lucide-react';

import type { OnboardingGoal } from '@/types/onboarding';
import { Column, Heading, Icon, Text } from '@components/primitives';
import { cn } from '@utils/cn';

type GoalOption = {
  id: OnboardingGoal;
  label: string;
};

const GOAL_OPTIONS: GoalOption[] = [
  { id: 'lose_weight', label: 'Lose weight' },
  { id: 'build_strength', label: 'Build strength' },
  { id: 'improve_mobility', label: 'Improve mobility' },
  { id: 'start_safely', label: 'Start exercising safely' },
  { id: 'fit_at_home', label: 'Get fit at home' },
];

type GoalSelectionStepProps = {
  headingId: string;
  selectedGoals: OnboardingGoal[];
  onToggleGoal: (goal: OnboardingGoal) => void;
};

export function GoalSelectionStep({
  headingId,
  selectedGoals,
  onToggleGoal,
}: GoalSelectionStepProps): JSX.Element {
  return (
    <Column gap="lg" className="flex-1">
      <Column gap="sm">
        <Heading id={headingId} level={1}>
          What&apos;s your goal?
        </Heading>
        <Text tone="muted">Pick all that apply.</Text>
      </Column>

      <Column gap="sm" role="group" aria-labelledby={headingId}>
        {GOAL_OPTIONS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          return (
            <button
              key={goal.id}
              type="button"
              aria-pressed={isSelected}
              className={cn(
                'flex min-h-16 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-motionly-primary focus-visible:ring-offset-2 focus-visible:ring-offset-motionly-bg-light dark:focus-visible:ring-offset-motionly-bg-dark',
                isSelected
                  ? 'border-motionly-primary bg-motionly-primary/10 text-motionly-neutral-900 dark:text-motionly-neutral-50'
                  : 'border-motionly-neutral-200 bg-motionly-neutral-50 text-motionly-neutral-900 hover:bg-motionly-neutral-100 active:bg-motionly-neutral-200 dark:border-motionly-neutral-800 dark:bg-motionly-neutral-900 dark:text-motionly-neutral-50 dark:hover:bg-motionly-neutral-800 dark:active:bg-motionly-neutral-800',
              )}
              onClick={() => onToggleGoal(goal.id)}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                  isSelected ? 'text-motionly-primary' : 'text-motionly-neutral-400',
                )}
                aria-hidden="true"
              >
                <Icon icon={isSelected ? Check : Circle} size="md" />
              </span>
              <Text as="span" variant="label" tone="inherit" className="flex-1">
                {goal.label}
              </Text>
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
