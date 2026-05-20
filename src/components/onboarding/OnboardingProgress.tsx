import { Check } from 'lucide-react';

import { Icon } from '@components/primitives';
import { cn } from '@utils/cn';

const STEP_LABELS = [
  'Welcome',
  'Goal',
  'Fitness level',
  'Movement limitations',
  'Camera tutorial',
] as const;

type OnboardingProgressProps = {
  currentStepNumber: number;
  totalSteps: number;
  disabled?: boolean;
  onStepSelect: (stepNumber: number) => void;
};

function dotClassName(status: 'completed' | 'current' | 'future'): string {
  if (status === 'completed') {
    return 'border-motionly-primary bg-motionly-primary text-white';
  }
  if (status === 'current') {
    return 'border-motionly-primary bg-motionly-primary/10 text-motionly-primary ring-4 ring-motionly-primary/10';
  }
  return 'border-motionly-neutral-200 bg-motionly-neutral-100 text-motionly-neutral-400 dark:border-motionly-neutral-800 dark:bg-motionly-neutral-900 dark:text-motionly-neutral-600';
}

export function OnboardingProgress({
  currentStepNumber,
  totalSteps,
  disabled = false,
  onStepSelect,
}: OnboardingProgressProps): JSX.Element {
  return (
    <nav aria-label={`Onboarding progress, step ${currentStepNumber} of ${totalSteps}`}>
      <ol className="flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const stepLabel = STEP_LABELS[index] ?? `Step ${stepNumber}`;
          const isCompleted = stepNumber < currentStepNumber;
          const isCurrent = stepNumber === currentStepNumber;
          const canNavigateBack = isCompleted && !disabled;
          const status = isCompleted ? 'completed' : isCurrent ? 'current' : 'future';
          const baseClassName = cn(
            'flex h-3 w-3 items-center justify-center rounded-full border transition-colors duration-150',
            dotClassName(status),
          );

          return (
            <li key={stepNumber} className="flex items-center">
              {canNavigateBack ? (
                <button
                  type="button"
                  className={cn(
                    baseClassName,
                    'h-5 w-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-motionly-primary focus-visible:ring-offset-2 focus-visible:ring-offset-motionly-bg-light dark:focus-visible:ring-offset-motionly-bg-dark',
                  )}
                  aria-label={`Go back to step ${stepNumber}: ${stepLabel}`}
                  onClick={() => onStepSelect(stepNumber)}
                >
                  <Icon icon={Check} size="sm" />
                </button>
              ) : (
                <span
                  className={baseClassName}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={
                    isCurrent
                      ? `Current step ${stepNumber}: ${stepLabel}`
                      : disabled && isCompleted
                        ? `Step ${stepNumber}: ${stepLabel} is unavailable while the current transition finishes`
                        : `Step ${stepNumber}: ${stepLabel} is upcoming`
                  }
                  role="img"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
