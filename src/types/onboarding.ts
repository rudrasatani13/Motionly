export type OnboardingGoal =
  | 'lose_weight'
  | 'build_strength'
  | 'improve_mobility'
  | 'start_safely'
  | 'fit_at_home';

export type FitnessLevel = 'beginner' | 'intermediate' | 'active';

export type OnboardingStep = 'welcome' | 'goal' | 'fitness_level';

export type OnboardingDraft = {
  currentStep: OnboardingStep;
  selectedGoals: OnboardingGoal[];
  selectedFitnessLevel: FitnessLevel | null;
};
