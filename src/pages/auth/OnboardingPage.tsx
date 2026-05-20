import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import type { OnboardingStep } from '@/types/onboarding';
import {
  FitnessLevelStep,
  GoalSelectionStep,
  OnboardingShell,
  Phase12HandoffPanel,
  WelcomeStep,
} from '@components/onboarding';
import { useNavigation } from '@hooks/useNavigation';
import {
  getOnboardingStepNumber,
  ONBOARDING_TOTAL_STEPS,
  PHASE_11_ONBOARDING_STEPS,
  useOnboardingStore,
} from '@store/useOnboardingStore';

type TransitionDirection = 1 | -1;

const STEP_BY_NUMBER: Record<number, OnboardingStep> = {
  1: 'welcome',
  2: 'goal',
  3: 'fitness_level',
};

function getStepFromNumber(stepNumber: number): OnboardingStep | null {
  return STEP_BY_NUMBER[stepNumber] ?? null;
}

export default function OnboardingPage(): JSX.Element {
  const { goToWelcome } = useNavigation();
  const prefersReducedMotion = useReducedMotion();
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPhase12Handoff, setShowPhase12Handoff] = useState(false);

  const currentStep = useOnboardingStore((state) => state.currentStep);
  const selectedGoals = useOnboardingStore((state) => state.selectedGoals);
  const selectedFitnessLevel = useOnboardingStore((state) => state.selectedFitnessLevel);
  const setStep = useOnboardingStore((state) => state.setStep);
  const goNext = useOnboardingStore((state) => state.goNext);
  const goBack = useOnboardingStore((state) => state.goBack);
  const toggleGoal = useOnboardingStore((state) => state.toggleGoal);
  const setFitnessLevel = useOnboardingStore((state) => state.setFitnessLevel);

  const currentStepNumber = getOnboardingStepNumber(currentStep);
  const viewKey = showPhase12Handoff ? 'phase-12-handoff' : currentStep;
  const headingId = `onboarding-${viewKey}-heading`;
  const continueDisabled =
    currentStep === 'goal'
      ? selectedGoals.length === 0
      : currentStep === 'fitness_level' && showPhase12Handoff === false
        ? selectedFitnessLevel === null
        : false;
  const primaryLabel = showPhase12Handoff
    ? 'Revise Fitness Level'
    : currentStep === 'welcome'
      ? 'Get Started'
      : 'Continue';
  const backLabel = showPhase12Handoff
    ? 'Return to fitness level selection'
    : currentStep === 'welcome'
      ? 'Back to welcome page'
      : `Back to onboarding step ${currentStepNumber - 1}`;

  function handleBack(): void {
    if (isTransitioning) {
      return;
    }

    setTransitionDirection(-1);
    if (showPhase12Handoff) {
      setIsTransitioning(true);
      setShowPhase12Handoff(false);
      return;
    }
    if (currentStep === 'welcome') {
      goToWelcome();
      return;
    }
    setIsTransitioning(true);
    goBack();
  }

  function handlePrimary(): void {
    if (isTransitioning || continueDisabled) {
      return;
    }

    if (showPhase12Handoff) {
      setTransitionDirection(-1);
      setIsTransitioning(true);
      setShowPhase12Handoff(false);
      return;
    }

    if (currentStep === 'fitness_level') {
      setTransitionDirection(1);
      setIsTransitioning(true);
      setShowPhase12Handoff(true);
      return;
    }

    setTransitionDirection(1);
    setIsTransitioning(true);
    goNext();
  }

  function handleStepSelect(stepNumber: number): void {
    if (isTransitioning) {
      return;
    }

    if (stepNumber >= currentStepNumber) {
      return;
    }

    const step = getStepFromNumber(stepNumber);
    if (step === null) {
      return;
    }

    setTransitionDirection(-1);
    setIsTransitioning(true);
    setShowPhase12Handoff(false);
    setStep(step);
  }

  function renderStep(): JSX.Element {
    if (showPhase12Handoff) {
      return <Phase12HandoffPanel headingId={headingId} />;
    }

    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep headingId={headingId} />;
      case 'goal':
        return (
          <GoalSelectionStep
            headingId={headingId}
            selectedGoals={selectedGoals}
            onToggleGoal={toggleGoal}
          />
        );
      case 'fitness_level':
        return (
          <FitnessLevelStep
            headingId={headingId}
            selectedFitnessLevel={selectedFitnessLevel}
            onSelectFitnessLevel={setFitnessLevel}
          />
        );
      default:
        return <WelcomeStep headingId={headingId} />;
    }
  }

  return (
    <OnboardingShell
      currentStepNumber={currentStepNumber}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      phaseMaxStepNumber={PHASE_11_ONBOARDING_STEPS.length}
      headingId={headingId}
      transitionKey={viewKey}
      backLabel={backLabel}
      primaryLabel={primaryLabel}
      primaryDisabled={continueDisabled}
      controlsDisabled={isTransitioning}
      onBack={handleBack}
      onPrimary={handlePrimary}
      onStepSelect={handleStepSelect}
    >
      <AnimatePresence mode="wait" custom={transitionDirection}>
        <motion.div
          key={viewKey}
          custom={transitionDirection}
          variants={{
            enter: (direction: TransitionDirection) => ({
              opacity: 0,
              x: prefersReducedMotion ? 0 : direction * 24,
            }),
            center: {
              opacity: 1,
              x: 0,
            },
            exit: (direction: TransitionDirection) => ({
              opacity: 0,
              x: prefersReducedMotion ? 0 : direction * -24,
            }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: prefersReducedMotion ? 0 : 0.18,
            ease: [0.2, 0, 0, 1],
          }}
          onAnimationComplete={() => setIsTransitioning(false)}
          className="flex flex-1 flex-col"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </OnboardingShell>
  );
}
