import { create } from 'zustand';

import type {
  FitnessLevel,
  OnboardingDraft,
  OnboardingGoal,
  OnboardingStep,
} from '@/types/onboarding';

const PHASE_11_STEPS: OnboardingStep[] = ['welcome', 'goal', 'fitness_level'];

export const ONBOARDING_TOTAL_STEPS = 5;
export const PHASE_11_ONBOARDING_STEPS = PHASE_11_STEPS;

export type OnboardingStore = OnboardingDraft & {
  setStep: (step: OnboardingStep) => void;
  goNext: () => void;
  goBack: () => void;
  toggleGoal: (goal: OnboardingGoal) => void;
  setFitnessLevel: (level: FitnessLevel) => void;
  resetOnboardingDraft: () => void;
};

const initialDraft: OnboardingDraft = {
  currentStep: 'welcome',
  selectedGoals: [],
  selectedFitnessLevel: null,
};

function stepIndex(step: OnboardingStep): number {
  return PHASE_11_STEPS.indexOf(step);
}

export function getOnboardingStepNumber(step: OnboardingStep): number {
  return stepIndex(step) + 1;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  ...initialDraft,

  setStep: (step) => {
    set({ currentStep: step });
  },

  goNext: () => {
    set((state) => {
      const nextIndex = Math.min(stepIndex(state.currentStep) + 1, PHASE_11_STEPS.length - 1);
      return { currentStep: PHASE_11_STEPS[nextIndex] };
    });
  },

  goBack: () => {
    set((state) => {
      const previousIndex = Math.max(stepIndex(state.currentStep) - 1, 0);
      return { currentStep: PHASE_11_STEPS[previousIndex] };
    });
  },

  toggleGoal: (goal) => {
    set((state) => {
      const isSelected = state.selectedGoals.includes(goal);
      return {
        selectedGoals: isSelected
          ? state.selectedGoals.filter((selectedGoal) => selectedGoal !== goal)
          : [...state.selectedGoals, goal],
      };
    });
  },

  setFitnessLevel: (level) => {
    set({ selectedFitnessLevel: level });
  },

  resetOnboardingDraft: () => {
    set(initialDraft);
  },
}));
