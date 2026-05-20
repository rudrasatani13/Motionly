import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import type { OnboardingStep } from '@/types/onboarding';
import {
  CameraTutorialStep,
  FitnessLevelStep,
  GoalSelectionStep,
  LimitationsStep,
  OnboardingShell,
  WelcomeStep,
} from '@components/onboarding';
import { useNavigation } from '@hooks/useNavigation';
import {
  requestCameraPermissionForOnboarding,
  type CameraPermissionResult,
} from '@platform/camera-permission';
import { completeOnboardingStorage } from '@platform/onboarding-storage';
import {
  getOnboardingStepNumber,
  ONBOARDING_STEP_ORDER,
  ONBOARDING_TOTAL_STEPS,
  useOnboardingStore,
} from '@store/useOnboardingStore';

type TransitionDirection = 1 | -1;

function getStepFromNumber(stepNumber: number): OnboardingStep | null {
  return ONBOARDING_STEP_ORDER[stepNumber - 1] ?? null;
}

function deniedMessageFor(reason: 'user-blocked' | 'security'): string {
  if (reason === 'security') {
    return 'Your browser blocked the request for security reasons. Make sure the page is loaded over HTTPS (or localhost) and try again.';
  }
  return 'Camera access was blocked. Open your browser site settings to allow camera, then tap Allow camera access again.';
}

function unavailableMessageFor(
  reason: 'no-camera' | 'unsupported-browser' | 'insecure-context',
): string {
  if (reason === 'no-camera') {
    return 'No camera was detected on this device.';
  }
  if (reason === 'unsupported-browser') {
    return 'This browser does not support camera access.';
  }
  return 'This page is not running on a secure connection (HTTPS or localhost), so the camera cannot be used yet.';
}

export default function OnboardingPage(): JSX.Element {
  const { goToWelcome, goHome } = useNavigation();
  const prefersReducedMotion = useReducedMotion();
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const currentStep = useOnboardingStore((state) => state.currentStep);
  const selectedGoals = useOnboardingStore((state) => state.selectedGoals);
  const selectedFitnessLevel = useOnboardingStore((state) => state.selectedFitnessLevel);
  const selectedLimitations = useOnboardingStore((state) => state.selectedLimitations);
  const limitationNotes = useOnboardingStore((state) => state.limitationNotes);
  const cameraPermissionStatus = useOnboardingStore((state) => state.cameraPermissionStatus);
  const cameraPermissionErrorMessage = useOnboardingStore(
    (state) => state.cameraPermissionErrorMessage,
  );
  const setStep = useOnboardingStore((state) => state.setStep);
  const goNext = useOnboardingStore((state) => state.goNext);
  const goBack = useOnboardingStore((state) => state.goBack);
  const toggleGoal = useOnboardingStore((state) => state.toggleGoal);
  const setFitnessLevel = useOnboardingStore((state) => state.setFitnessLevel);
  const toggleLimitation = useOnboardingStore((state) => state.toggleLimitation);
  const setLimitationNotes = useOnboardingStore((state) => state.setLimitationNotes);
  const setCameraPermissionStatus = useOnboardingStore((state) => state.setCameraPermissionStatus);
  const setCameraPermissionErrorMessage = useOnboardingStore(
    (state) => state.setCameraPermissionErrorMessage,
  );
  const markOnboardingCompleteInMemory = useOnboardingStore(
    (state) => state.markOnboardingCompleteInMemory,
  );

  const currentStepNumber = getOnboardingStepNumber(currentStep);
  const headingId = `onboarding-${currentStep}-heading`;

  function isContinueDisabled(): boolean {
    if (currentStep === 'goal') {
      return selectedGoals.length === 0;
    }
    if (currentStep === 'fitness_level') {
      return selectedFitnessLevel === null;
    }
    if (currentStep === 'limitations') {
      // Require either at least one specific limitation or an explicit
      // "None" so the user always answers consciously.
      return selectedLimitations.length === 0;
    }
    return false;
  }

  const continueDisabled = isContinueDisabled();

  function primaryLabelFor(): string {
    if (currentStep === 'welcome') {
      return 'Get Started';
    }
    if (currentStep === 'camera_tutorial') {
      if (cameraPermissionStatus === 'denied' || cameraPermissionStatus === 'error') {
        return 'Try again';
      }
      return 'Allow camera access';
    }
    return 'Continue';
  }

  const primaryLabel = primaryLabelFor();
  const primaryLoading =
    currentStep === 'camera_tutorial' && (cameraPermissionStatus === 'requesting' || isCompleting);
  const primaryLoadingLabel = isCompleting
    ? 'Saving your preferences…'
    : 'Requesting camera permission…';

  const backLabel =
    currentStep === 'welcome'
      ? 'Back to welcome page'
      : `Back to onboarding step ${currentStepNumber - 1}`;

  function handleBack(): void {
    if (isTransitioning || isCompleting) {
      return;
    }
    setTransitionDirection(-1);
    if (currentStep === 'welcome') {
      goToWelcome();
      return;
    }
    setIsTransitioning(true);
    goBack();
  }

  async function finishOnboarding(cameraGranted: boolean): Promise<void> {
    setIsCompleting(true);
    const completedAt = new Date().toISOString();
    await completeOnboardingStorage({
      completedAt,
      goals: selectedGoals,
      fitnessLevel: selectedFitnessLevel,
      limitations: selectedLimitations,
      limitationNotes,
      cameraPermissionGranted: cameraGranted,
    });
    markOnboardingCompleteInMemory(completedAt);
    setIsCompleting(false);
    goHome();
  }

  async function handleCameraCta(): Promise<void> {
    setCameraPermissionErrorMessage(null);
    setCameraPermissionStatus('requesting');
    const result: CameraPermissionResult = await requestCameraPermissionForOnboarding();
    if (result.kind === 'granted') {
      setCameraPermissionStatus('granted');
      await finishOnboarding(true);
      return;
    }
    if (result.kind === 'denied') {
      setCameraPermissionStatus('denied');
      setCameraPermissionErrorMessage(deniedMessageFor(result.reason));
      return;
    }
    if (result.kind === 'unavailable') {
      setCameraPermissionStatus('unavailable');
      setCameraPermissionErrorMessage(unavailableMessageFor(result.reason));
      return;
    }
    setCameraPermissionStatus('error');
    setCameraPermissionErrorMessage(result.message);
  }

  function handleContinueWithoutCamera(): void {
    if (isCompleting) {
      return;
    }
    void finishOnboarding(false);
  }

  function handlePrimary(): void {
    if (isTransitioning || continueDisabled || isCompleting) {
      return;
    }
    if (currentStep === 'camera_tutorial') {
      void handleCameraCta();
      return;
    }
    setTransitionDirection(1);
    setIsTransitioning(true);
    goNext();
  }

  function handleStepSelect(stepNumber: number): void {
    if (isTransitioning || isCompleting) {
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
    setStep(step);
  }

  function renderStep(): JSX.Element {
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
      case 'limitations':
        return (
          <LimitationsStep
            headingId={headingId}
            selectedLimitations={selectedLimitations}
            limitationNotes={limitationNotes}
            onToggleLimitation={toggleLimitation}
            onChangeLimitationNotes={setLimitationNotes}
          />
        );
      case 'camera_tutorial':
        return (
          <CameraTutorialStep
            headingId={headingId}
            cameraPermissionStatus={cameraPermissionStatus}
            cameraPermissionErrorMessage={cameraPermissionErrorMessage}
            isCompleting={isCompleting}
            onContinueWithoutCamera={handleContinueWithoutCamera}
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
      headingId={headingId}
      transitionKey={currentStep}
      backLabel={backLabel}
      primaryLabel={primaryLabel}
      primaryDisabled={continueDisabled}
      primaryLoading={primaryLoading}
      primaryLoadingLabel={primaryLoadingLabel}
      controlsDisabled={isTransitioning || isCompleting}
      onBack={handleBack}
      onPrimary={handlePrimary}
      onStepSelect={handleStepSelect}
    >
      <AnimatePresence mode="wait" custom={transitionDirection}>
        <motion.div
          key={currentStep}
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
