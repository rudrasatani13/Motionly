import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

import { Button, Icon, Row, Text } from '@components/primitives';

import { OnboardingProgress } from './OnboardingProgress';

type OnboardingShellProps = {
  currentStepNumber: number;
  totalSteps: number;
  headingId: string;
  transitionKey: string;
  backLabel: string;
  primaryLabel: string;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  primaryLoadingLabel?: string;
  controlsDisabled?: boolean;
  onBack: () => void;
  onPrimary: () => void;
  onStepSelect: (stepNumber: number) => void;
  children: ReactNode;
};

export function OnboardingShell({
  currentStepNumber,
  totalSteps,
  headingId,
  transitionKey,
  backLabel,
  primaryLabel,
  primaryDisabled = false,
  primaryLoading = false,
  primaryLoadingLabel,
  controlsDisabled = false,
  onBack,
  onPrimary,
  onStepSelect,
  children,
}: OnboardingShellProps): JSX.Element {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.focus();
  }, [transitionKey]);

  return (
    <div className="flex min-h-[calc(100dvh-5.5rem)] flex-1 flex-col px-2 pt-2 sm:px-6 sm:pt-6">
      <Row align="center" justify="between" className="min-h-11">
        <Button variant="icon" aria-label={backLabel} disabled={controlsDisabled} onClick={onBack}>
          <Icon icon={ArrowLeft} />
        </Button>
        <Text variant="caption" tone="muted" className="font-medium">
          {currentStepNumber} / {totalSteps}
        </Text>
      </Row>

      <div className="pt-3">
        <OnboardingProgress
          currentStepNumber={currentStepNumber}
          totalSteps={totalSteps}
          disabled={controlsDisabled}
          onStepSelect={onStepSelect}
        />
      </div>

      <section
        ref={contentRef}
        tabIndex={-1}
        className="flex flex-1 flex-col overflow-x-hidden py-6 focus:outline-none"
        aria-labelledby={headingId}
      >
        {children}
      </section>

      <div className="mt-auto pb-3 pt-4">
        <Button
          fullWidth
          size="lg"
          disabled={primaryDisabled || controlsDisabled}
          aria-disabled={primaryDisabled || controlsDisabled}
          loading={primaryLoading}
          loadingLabel={primaryLoadingLabel}
          onClick={onPrimary}
        >
          {primaryLabel}
        </Button>
      </div>
    </div>
  );
}
