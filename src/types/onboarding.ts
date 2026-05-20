export type OnboardingGoal =
  | 'lose_weight'
  | 'build_strength'
  | 'improve_mobility'
  | 'start_safely'
  | 'fit_at_home';

export type FitnessLevel = 'beginner' | 'intermediate' | 'active';

export type OnboardingStep =
  | 'welcome'
  | 'goal'
  | 'fitness_level'
  | 'limitations'
  | 'camera_tutorial';

/**
 * Areas the user wants Motionly to go easier on.
 *
 * Phase 12 collects this list to inform future workout-adaptation
 * logic. Selecting `none` means the user opted out of flagging any
 * specific area; it is not the absence of an answer. The store keeps
 * `none` mutually exclusive with the specific limitations.
 *
 * Phase 12 does **not** treat any of these as medical data, does not
 * imply diagnosis, and does not change workouts yet — adaptation
 * logic ships in later workout-library / pre-workout phases.
 */
export type MovementLimitation =
  | 'lower_back'
  | 'knees'
  | 'shoulders'
  | 'hips'
  | 'ankles'
  | 'wrists'
  | 'none';

/**
 * State of the user's most recent camera-permission request.
 *
 * Phase 12 only checks the browser permission via the platform
 * adapter (`src/platform/camera-permission.ts`); it never keeps a
 * camera stream open and never renders a real preview.
 *
 * - `idle` — nothing requested yet in this session.
 * - `requesting` — `getUserMedia` is in flight (CTA loading state).
 * - `granted` — permission granted; stream stopped immediately.
 * - `denied` — user (or system) blocked the request.
 * - `unavailable` — no camera device, unsupported browser, or
 *   insecure context (e.g. plain HTTP).
 * - `error` — anything else; treated as recoverable.
 */
export type CameraPermissionStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'error';

/**
 * Maximum length of the optional free-text "anything else" field on
 * the Limitations step. Centralized so the store, the component, and
 * any future writer agree on the limit.
 */
export const LIMITATION_NOTES_MAX_LENGTH = 120;

export type OnboardingDraft = {
  currentStep: OnboardingStep;
  selectedGoals: OnboardingGoal[];
  selectedFitnessLevel: FitnessLevel | null;
  selectedLimitations: MovementLimitation[];
  limitationNotes: string;
  cameraPermissionStatus: CameraPermissionStatus;
  cameraPermissionErrorMessage: string | null;
  onboardingCompletedAt: string | null;
};
