import { create } from 'zustand';

import {
  LIMITATION_NOTES_MAX_LENGTH,
  type CameraPermissionStatus,
  type FitnessLevel,
  type MovementLimitation,
  type OnboardingDraft,
  type OnboardingGoal,
  type OnboardingStep,
} from '@/types/onboarding';

const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'goal',
  'fitness_level',
  'limitations',
  'camera_tutorial',
];

export const ONBOARDING_TOTAL_STEPS = ONBOARDING_STEPS.length;
export const ONBOARDING_STEP_ORDER = ONBOARDING_STEPS;

export type OnboardingStore = OnboardingDraft & {
  setStep: (step: OnboardingStep) => void;
  goNext: () => void;
  goBack: () => void;
  toggleGoal: (goal: OnboardingGoal) => void;
  setFitnessLevel: (level: FitnessLevel) => void;
  toggleLimitation: (limitation: MovementLimitation) => void;
  setLimitationNotes: (notes: string) => void;
  setCameraPermissionStatus: (status: CameraPermissionStatus) => void;
  setCameraPermissionErrorMessage: (message: string | null) => void;
  markOnboardingCompleteInMemory: (completedAt: string) => void;
  resetOnboardingDraft: () => void;
};

const initialDraft: OnboardingDraft = {
  currentStep: 'welcome',
  selectedGoals: [],
  selectedFitnessLevel: null,
  selectedLimitations: [],
  limitationNotes: '',
  cameraPermissionStatus: 'idle',
  cameraPermissionErrorMessage: null,
  onboardingCompletedAt: null,
};

function stepIndex(step: OnboardingStep): number {
  return ONBOARDING_STEPS.indexOf(step);
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
      const nextIndex = Math.min(stepIndex(state.currentStep) + 1, ONBOARDING_STEPS.length - 1);
      return { currentStep: ONBOARDING_STEPS[nextIndex] };
    });
  },

  goBack: () => {
    set((state) => {
      const previousIndex = Math.max(stepIndex(state.currentStep) - 1, 0);
      return { currentStep: ONBOARDING_STEPS[previousIndex] };
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

  toggleLimitation: (limitation) => {
    set((state) => {
      const isSelected = state.selectedLimitations.includes(limitation);
      // Selecting "none" clears all other limitations; selecting any
      // specific limitation while "none" is in the list removes "none".
      if (limitation === 'none') {
        return { selectedLimitations: isSelected ? [] : ['none'] };
      }
      const withoutNone = state.selectedLimitations.filter((value) => value !== 'none');
      return {
        selectedLimitations: isSelected
          ? withoutNone.filter((value) => value !== limitation)
          : [...withoutNone, limitation],
      };
    });
  },

  setLimitationNotes: (notes) => {
    set({ limitationNotes: notes.slice(0, LIMITATION_NOTES_MAX_LENGTH) });
  },

  setCameraPermissionStatus: (status) => {
    set({ cameraPermissionStatus: status });
  },

  setCameraPermissionErrorMessage: (message) => {
    set({ cameraPermissionErrorMessage: message });
  },

  markOnboardingCompleteInMemory: (completedAt) => {
    set({ onboardingCompletedAt: completedAt });
  },

  resetOnboardingDraft: () => {
    set(initialDraft);
  },
}));
