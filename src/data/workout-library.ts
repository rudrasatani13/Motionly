/**
 * Phase 14 — Canonical Motionly workout & exercise library.
 *
 * This file is the **single source of truth** for the small MVP
 * browsing catalog rendered by `WorkoutLibraryPage`. Treat it as
 * static product content (like marketing copy or onboarding text)
 * — not as user data, not as fake/demo/sample data.
 *
 * Strict rules:
 * - No completion stats, ratings, popularity, calorie counts, form
 *   scores, rep counts, or AI-generated results. The library
 *   describes movements; user data lives elsewhere (later phases).
 * - No medical or injury-prevention claims. Copy is supportive and
 *   beginner-friendly; if a movement could be unsafe in some
 *   contexts, the instructions tell the user to stop if anything
 *   hurts.
 * - Ids are stable, slug-style strings — they appear in URLs
 *   (`/workouts/:id`) and React keys, so renaming an id requires a
 *   conscious migration.
 * - Phase 15 (workout detail) will read by id from this same file
 *   until a real database/seed layer lands.
 */

import type {
  ExerciseSummary,
  WorkoutDetail,
  WorkoutExerciseSequenceItem,
  WorkoutLimitationArea,
  WorkoutSummary,
} from '@/types/workout-library';

/**
 * Canonical workouts available in the browse surface.
 *
 * Order here is the order rendered when no filter narrows the list.
 * Mix of difficulties and categories is intentional so the default
 * scroll surfaces variety, not a single style.
 */
export const WORKOUT_CATALOG: ReadonlyArray<WorkoutSummary> = [
  {
    id: 'lower-body-foundations',
    name: 'Lower Body Foundations',
    description:
      'A gentle introduction to the squat, hinge, and bridge patterns that build a strong lower body.',
    durationMinutes: 12,
    exerciseCount: 5,
    difficulty: 'beginner',
    categories: ['lower_body', 'strength'],
    equipment: 'None',
    accessTier: 'free',
    coachingFocus: 'Steady tempo, balanced stance, hips and knees aligned.',
    artworkTone: 'primary',
  },
  {
    id: 'push-and-pull-basics',
    name: 'Push & Pull Basics',
    description:
      'Beginner-safe pushing and bracing work using wall and incline variations of the push-up.',
    durationMinutes: 10,
    exerciseCount: 4,
    difficulty: 'beginner',
    categories: ['upper_body', 'strength'],
    equipment: 'None',
    accessTier: 'free',
    coachingFocus: 'Shoulders set, ribs down, slow controlled lowering.',
    artworkTone: 'sky',
  },
  {
    id: 'mobility-reset',
    name: 'Mobility Reset',
    description:
      'A short, calm mobility flow to ease the spine, hips, and shoulders between training days.',
    durationMinutes: 8,
    exerciseCount: 6,
    difficulty: 'beginner',
    categories: ['mobility', 'full_body', 'quick'],
    equipment: 'None',
    accessTier: 'free',
    coachingFocus: 'Gentle range, easy breathing, no forcing positions.',
    artworkTone: 'accent',
  },
  {
    id: 'quick-core-15',
    name: 'Quick Core 15',
    description:
      'A focused core session built around bracing positions — plank, dead bug, and bird dog.',
    durationMinutes: 15,
    exerciseCount: 5,
    difficulty: 'intermediate',
    categories: ['core', 'strength', 'quick'],
    equipment: 'None',
    accessTier: 'free',
    coachingFocus: 'Hold a quiet ribcage, breathe through holds, stop if your low back complains.',
    artworkTone: 'warning',
  },
  {
    id: 'full-body-flow',
    name: 'Full Body Flow',
    description:
      'A balanced full-body workout combining squats, push-ups, bridges, and bracing patterns.',
    durationMinutes: 20,
    exerciseCount: 7,
    difficulty: 'intermediate',
    categories: ['full_body', 'strength'],
    equipment: 'None',
    accessTier: 'free',
    coachingFocus: 'Move smoothly between movements, rest as needed between sets.',
    artworkTone: 'primary',
  },
  {
    id: 'hip-mobility-flow',
    name: 'Hip Mobility Flow',
    description:
      'Targeted hip and hamstring mobility with controlled hip hinges and cat-cow transitions.',
    durationMinutes: 10,
    exerciseCount: 5,
    difficulty: 'beginner',
    categories: ['mobility', 'lower_body', 'quick'],
    equipment: 'None',
    accessTier: 'pro',
    coachingFocus: 'Find the end of comfortable range — do not chase a stretch.',
    artworkTone: 'rose',
  },
  {
    id: 'core-and-control',
    name: 'Core & Control',
    description:
      'A longer core session focused on anti-rotation and slow, deliberate bracing work.',
    durationMinutes: 18,
    exerciseCount: 6,
    difficulty: 'advanced',
    categories: ['core', 'strength'],
    equipment: 'None',
    accessTier: 'pro',
    coachingFocus: 'Quality over quantity — every rep is slow, even, and braced.',
    artworkTone: 'accent',
  },
  {
    id: 'evening-wind-down',
    name: 'Evening Wind-Down',
    description: 'A short, low-intensity mobility sequence designed for the end of the day.',
    durationMinutes: 7,
    exerciseCount: 4,
    difficulty: 'beginner',
    categories: ['mobility', 'quick', 'full_body'],
    equipment: 'None',
    accessTier: 'free',
    coachingFocus: 'Breathe through each position; if anything feels sharp, back off.',
    artworkTone: 'neutral',
  },
];

/**
 * Canonical exercises available in the browse surface.
 *
 * `whatMotionlyWillCoach` describes what the **future** ML/coaching
 * stack will check for — phrased as future capability, never as a
 * live claim. `cameraPlacementSummary` previews the Phase 16 camera
 * setup guidance without launching the camera.
 */
export const EXERCISE_CATALOG: ReadonlyArray<ExerciseSummary> = [
  {
    id: 'bodyweight-squat',
    name: 'Bodyweight Squat',
    targetMuscles: ['legs', 'glutes', 'core'],
    difficulty: 'beginner',
    equipment: 'None',
    description: 'A foundational lower-body pattern that builds hip, knee, and ankle strength.',
    whatMotionlyWillCoach: [
      'Depth and knee-over-toe alignment.',
      'Even weight between both feet.',
      'Neutral spine throughout the rep.',
    ],
    cameraPlacementSummary:
      'Place the phone at hip height, ~2 metres away, with your full body in frame from the side.',
    accessTier: 'free',
    instructions: [
      'Stand with feet about shoulder-width apart, toes pointing slightly out.',
      'Sit back as if reaching for a chair, keeping your chest tall.',
      'Lower to a comfortable depth without pain, then drive evenly through both feet to stand.',
      'Stop the set if anything feels sharp in the knees, hips, or low back.',
    ],
    estimatedRepsRange: '8-12',
    artworkTone: 'primary',
  },
  {
    id: 'reverse-lunge',
    name: 'Reverse Lunge',
    targetMuscles: ['legs', 'glutes', 'hips'],
    difficulty: 'beginner',
    equipment: 'None',
    description: 'Single-leg strength and balance built from a stable split stance.',
    whatMotionlyWillCoach: [
      'Front-knee tracking over the toes.',
      'Upright torso through the rep.',
      'Even step length on both sides.',
    ],
    cameraPlacementSummary:
      'Phone at hip height, side-on, ~2 metres away. Leave room to step back.',
    accessTier: 'free',
    instructions: [
      'Stand tall with feet hip-width apart.',
      'Step one foot back and lower the back knee toward the floor.',
      'Drive through the front foot to return to standing.',
      'Alternate sides; reduce range or skip the set if your knees feel cranky.',
    ],
    estimatedRepsRange: '6-10 per side',
    artworkTone: 'sky',
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    targetMuscles: ['glutes', 'core', 'hips'],
    difficulty: 'beginner',
    equipment: 'None',
    description: 'A hip-extension drill that strengthens the glutes without loading the spine.',
    whatMotionlyWillCoach: [
      'Hip drive height without hyperextending the low back.',
      'Even pressure through both feet.',
      'Steady, controlled lowering.',
    ],
    cameraPlacementSummary: 'Phone at floor level, side-on, framing hips and knees.',
    accessTier: 'free',
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor.',
      'Press through the heels to lift the hips until your body forms a straight line from knees to shoulders.',
      'Pause briefly at the top, then lower with control.',
      'If you feel this in your low back, lift less high.',
    ],
    estimatedRepsRange: '10-15',
    artworkTone: 'accent',
  },
  {
    id: 'incline-push-up',
    name: 'Incline Push-Up',
    targetMuscles: ['chest', 'arms', 'shoulders', 'core'],
    difficulty: 'beginner',
    equipment: 'A sturdy surface (counter, sofa back, sturdy chair)',
    description:
      'An accessible push-up variation that scales by adjusting the height of the surface.',
    whatMotionlyWillCoach: [
      'Body in one straight line from head to heels.',
      'Elbows tracking at roughly 45 degrees from the torso.',
      'Full range without losing the brace.',
    ],
    cameraPlacementSummary: 'Phone at chest height, side-on, framing head to heels.',
    accessTier: 'free',
    instructions: [
      'Set your hands on a sturdy surface a little wider than shoulders.',
      'Step your feet back so your body forms one straight line.',
      'Lower under control until your chest is just above the surface, then press back up.',
      'Raise the surface to make it easier; lower it to make it harder.',
    ],
    estimatedRepsRange: '6-12',
    artworkTone: 'sky',
  },
  {
    id: 'plank',
    name: 'Plank',
    targetMuscles: ['core', 'shoulders'],
    difficulty: 'beginner',
    equipment: 'None',
    description: 'An isometric hold that trains whole-body bracing.',
    whatMotionlyWillCoach: [
      'Hips level with shoulders, not sagging or piking.',
      'A steady breathing pattern.',
      'Quiet shoulders and a neutral neck.',
    ],
    cameraPlacementSummary: 'Phone at floor level, side-on, framing the whole body.',
    accessTier: 'free',
    instructions: [
      'Set forearms on the floor, elbows under shoulders.',
      'Step back into a straight-line plank from head to heels.',
      'Breathe steadily and brace your core; come down if your form starts to slip.',
      'Drop to the knees if the full plank is too much today.',
    ],
    estimatedSeconds: 30,
    artworkTone: 'warning',
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    targetMuscles: ['core'],
    difficulty: 'beginner',
    equipment: 'None',
    description: 'A back-friendly core drill that trains bracing under moving limbs.',
    whatMotionlyWillCoach: [
      'Low back staying lightly pressed into the floor.',
      'Slow, opposite-arm-and-leg extensions.',
      'Steady breathing — no breath-holding.',
    ],
    cameraPlacementSummary: 'Phone at floor level, framing the full body from the side.',
    accessTier: 'free',
    instructions: [
      'Lie on your back with arms reaching to the ceiling and knees stacked over hips.',
      'Slowly lower the opposite arm and leg toward the floor.',
      'Return to the start, then switch sides.',
      'Keep the low back lightly in contact with the floor throughout.',
    ],
    estimatedRepsRange: '6-10 per side',
    artworkTone: 'accent',
  },
  {
    id: 'bird-dog',
    name: 'Bird Dog',
    targetMuscles: ['core', 'back', 'glutes'],
    difficulty: 'beginner',
    equipment: 'None',
    description: 'A controlled anti-rotation drill on hands and knees.',
    whatMotionlyWillCoach: [
      'Hips and shoulders staying square to the floor.',
      'Opposite arm and leg reaching evenly.',
      'A flat back, not arched or rounded.',
    ],
    cameraPlacementSummary: 'Phone at floor level, framing head, hips, and feet.',
    accessTier: 'free',
    instructions: [
      'Set up on hands and knees, wrists under shoulders and knees under hips.',
      'Slowly extend the opposite arm and leg until they are roughly parallel to the floor.',
      'Return to the start and switch sides.',
      'Keep your hips quiet — imagine balancing a glass of water on your low back.',
    ],
    estimatedRepsRange: '6-10 per side',
    artworkTone: 'sky',
  },
  {
    id: 'hip-hinge',
    name: 'Hip Hinge Drill',
    targetMuscles: ['hips', 'glutes', 'back'],
    difficulty: 'beginner',
    equipment: 'None',
    description: 'The fundamental hinge pattern that powers everyday lifts.',
    whatMotionlyWillCoach: [
      'Movement coming from the hips, not the low back.',
      'A long, neutral spine.',
      'Soft, unlocked knees.',
    ],
    cameraPlacementSummary: 'Phone at hip height, side-on, ~2 metres away.',
    accessTier: 'free',
    instructions: [
      'Stand tall with feet hip-width apart.',
      'Push your hips straight back as if closing a drawer behind you.',
      'Let your torso tip forward while keeping your back long.',
      'Stand back up by driving your hips forward; stop short of any low-back pinching.',
    ],
    estimatedRepsRange: '8-12',
    artworkTone: 'rose',
  },
  {
    id: 'shoulder-taps',
    name: 'Shoulder Taps',
    targetMuscles: ['core', 'shoulders'],
    difficulty: 'intermediate',
    equipment: 'None',
    description: 'A plank variation that trains anti-rotation while the hands take turns moving.',
    whatMotionlyWillCoach: [
      'Hips staying still while one hand lifts.',
      'A square set of shoulders.',
      'A steady, even tempo.',
    ],
    cameraPlacementSummary: 'Phone at floor level, framing the full body from the side.',
    accessTier: 'free',
    instructions: [
      'Set up in a high plank with hands under shoulders and feet a little wider than hip-width.',
      'Lift one hand to tap the opposite shoulder while keeping your hips level.',
      'Return the hand and switch sides under control.',
      'Drop to the knees if your hips start to rotate.',
    ],
    estimatedRepsRange: '5-8 per side',
    artworkTone: 'warning',
  },
  {
    id: 'calf-raise',
    name: 'Calf Raise',
    targetMuscles: ['legs'],
    difficulty: 'beginner',
    equipment: 'None',
    description: 'A simple ankle and calf strengthener you can do anywhere.',
    whatMotionlyWillCoach: [
      'Rising straight up, not tipping in or out at the ankle.',
      'A full pause at the top.',
      'A controlled lowering phase.',
    ],
    cameraPlacementSummary: 'Phone at ankle height, side-on, framing both feet.',
    accessTier: 'free',
    instructions: [
      'Stand tall, feet hip-width apart, near a wall or counter for balance if needed.',
      'Press up onto the balls of your feet.',
      'Pause briefly at the top, then lower with control.',
      'Avoid bouncing at the bottom.',
    ],
    estimatedRepsRange: '12-15',
    artworkTone: 'primary',
  },
  {
    id: 'cat-cow',
    name: 'Cat-Cow',
    targetMuscles: ['back', 'core'],
    difficulty: 'beginner',
    equipment: 'None',
    description: 'A gentle spinal mobility flow on hands and knees.',
    whatMotionlyWillCoach: [
      'Movement spread evenly along the spine.',
      'Breath in time with the movement.',
      'A comfortable range — no forcing extreme positions.',
    ],
    cameraPlacementSummary: 'Phone at floor level, framing the whole spine from the side.',
    accessTier: 'free',
    instructions: [
      'Set up on hands and knees with a neutral spine.',
      'Inhale and slowly arch into a long extension (cow).',
      'Exhale and round into a flexed shape (cat).',
      'Move at a pace your spine enjoys — stop if you feel any pinching.',
    ],
    estimatedRepsRange: '6-10 cycles',
    artworkTone: 'accent',
  },
  {
    id: 'standing-hamstring-walkout',
    name: 'Standing Hamstring Walkout',
    targetMuscles: ['hips', 'back', 'core'],
    difficulty: 'beginner',
    equipment: 'None',
    description: 'A gentle, full-body warm-up that wakes up the posterior chain.',
    whatMotionlyWillCoach: [
      'Long spine on the walk out.',
      'Soft knees in the hinge.',
      'A controlled walk back to standing.',
    ],
    cameraPlacementSummary: 'Phone at hip height, side-on, ~2 metres away.',
    accessTier: 'free',
    instructions: [
      'Stand tall, then hinge forward and place your hands on the floor (bend the knees as much as you need).',
      'Walk the hands out to a plank position.',
      'Walk the hands back toward the feet and stand up tall.',
      'Move slowly; this is a warm-up, not a race.',
    ],
    estimatedRepsRange: '4-6 cycles',
    artworkTone: 'sky',
  },
  {
    id: 'wall-press',
    name: 'Wall Press',
    targetMuscles: ['chest', 'shoulders', 'arms'],
    difficulty: 'beginner',
    equipment: 'A wall',
    description: 'The most accessible push-up variation — useful as a warm-up or scale-down.',
    whatMotionlyWillCoach: [
      'A straight line from head to heels.',
      'Elbows tracking on a comfortable angle.',
      'Full range without shrugging the shoulders.',
    ],
    cameraPlacementSummary: 'Phone at chest height, side-on, framing from head to heels.',
    accessTier: 'free',
    instructions: [
      'Stand an arm-length from a wall.',
      'Place your palms on the wall a little wider than shoulders.',
      'Lower your chest toward the wall, then press back.',
      'Step further from the wall to make it harder.',
    ],
    estimatedRepsRange: '10-15',
    artworkTone: 'neutral',
  },
];

const EXERCISE_LIMITATION_TAGS: Record<string, WorkoutLimitationArea[]> = {
  'bodyweight-squat': ['knees', 'hips', 'ankles'],
  'reverse-lunge': ['knees', 'hips', 'ankles'],
  'glute-bridge': ['hips'],
  'incline-push-up': ['shoulders', 'wrists'],
  plank: ['lower_back', 'shoulders', 'wrists'],
  'dead-bug': ['lower_back'],
  'bird-dog': ['lower_back', 'wrists'],
  'hip-hinge': ['lower_back', 'hips'],
  'shoulder-taps': ['shoulders', 'wrists'],
  'calf-raise': ['knees', 'ankles'],
  'cat-cow': [],
  'standing-hamstring-walkout': ['lower_back', 'hips'],
  'wall-press': ['shoulders'],
};

function withLimitationTags(
  item: Omit<WorkoutExerciseSequenceItem, 'limitationTags'>,
): WorkoutExerciseSequenceItem {
  return {
    ...item,
    limitationTags: EXERCISE_LIMITATION_TAGS[item.exerciseId] ?? [],
  };
}

type WorkoutDetailFields = Omit<
  WorkoutDetail,
  | keyof WorkoutSummary
  | 'id'
  | 'name'
  | 'description'
  | 'durationMinutes'
  | 'exerciseCount'
  | 'difficulty'
  | 'categories'
  | 'equipment'
  | 'accessTier'
  | 'artworkTone'
>;

function workoutSummary(id: string): WorkoutSummary {
  const workout = WORKOUT_CATALOG.find((item) => item.id === id);
  if (workout === undefined) {
    throw new Error(`Workout detail references unknown workout id: ${id}`);
  }
  return workout;
}

function createWorkoutDetail(id: string, fields: WorkoutDetailFields): WorkoutDetail {
  const summary = workoutSummary(id);
  if (summary.exerciseCount !== fields.exerciseSequence.length) {
    throw new Error(`Workout detail sequence count does not match summary for ${id}`);
  }
  return {
    ...summary,
    ...fields,
  };
}

/**
 * Canonical workout detail records used by `/workouts/:id`.
 *
 * These extend the Phase 14 browse catalog with authored sequence
 * content for Phase 15. They remain static product content — no user
 * completion state, ratings, calories, popularity, history, or live
 * coaching output lives here.
 */
export const WORKOUT_DETAIL_CATALOG: ReadonlyArray<WorkoutDetail> = [
  createWorkoutDetail('lower-body-foundations', {
    coachNote:
      'Move at a steady pace and rest whenever you need it. Camera setup comes next; stop any movement that hurts or feels wrong.',
    primaryMusclesWorked: ['legs', 'glutes'],
    secondaryMusclesWorked: ['hips', 'core'],
    exerciseSequence: [
      withLimitationTags({
        order: 1,
        exerciseId: 'bodyweight-squat',
        set: { type: 'reps', sets: 2, reps: '8-10' },
        restSeconds: 45,
        note: 'Use a comfortable depth and keep both feet grounded.',
      }),
      withLimitationTags({
        order: 2,
        exerciseId: 'hip-hinge',
        set: { type: 'reps', sets: 2, reps: '8-10' },
        restSeconds: 30,
        note: 'Hinge from the hips with soft knees and a long spine.',
      }),
      withLimitationTags({
        order: 3,
        exerciseId: 'glute-bridge',
        set: { type: 'reps', sets: 2, reps: '10-12' },
        restSeconds: 30,
        note: 'Pause at the top without arching through your low back.',
      }),
      withLimitationTags({
        order: 4,
        exerciseId: 'reverse-lunge',
        set: { type: 'reps', sets: 2, reps: '6 per side' },
        restSeconds: 45,
        note: 'Step back only as far as you can control smoothly.',
      }),
      withLimitationTags({
        order: 5,
        exerciseId: 'calf-raise',
        set: { type: 'reps', sets: 2, reps: '12-15' },
        restSeconds: 30,
        note: 'Rise and lower slowly instead of bouncing.',
      }),
    ],
  }),
  createWorkoutDetail('push-and-pull-basics', {
    coachNote:
      'Keep each rep quiet and controlled. If a pressing movement feels uncomfortable, raise the surface or skip that set.',
    primaryMusclesWorked: ['chest', 'shoulders', 'arms'],
    secondaryMusclesWorked: ['core'],
    exerciseSequence: [
      withLimitationTags({
        order: 1,
        exerciseId: 'wall-press',
        set: { type: 'reps', sets: 2, reps: '10-12' },
        restSeconds: 30,
        note: 'Start tall and keep your shoulders relaxed.',
      }),
      withLimitationTags({
        order: 2,
        exerciseId: 'incline-push-up',
        set: { type: 'reps', sets: 2, reps: '6-8' },
        restSeconds: 45,
        note: 'Choose a higher surface if you want a gentler angle.',
      }),
      withLimitationTags({
        order: 3,
        exerciseId: 'plank',
        set: { type: 'timed', sets: 2, seconds: 20 },
        restSeconds: 45,
        note: 'Drop to the knees if your brace starts to fade.',
      }),
      withLimitationTags({
        order: 4,
        exerciseId: 'shoulder-taps',
        set: { type: 'reps', sets: 2, reps: '5 per side' },
        restSeconds: 45,
        note: 'Move one hand at a time while keeping the hips still.',
      }),
    ],
  }),
  createWorkoutDetail('mobility-reset', {
    coachNote:
      'Use this as a reset, not a test. Stay inside an easy range and let the camera setup step happen only after you choose to start.',
    primaryMusclesWorked: ['hips', 'back', 'shoulders'],
    secondaryMusclesWorked: ['core', 'glutes'],
    exerciseSequence: [
      withLimitationTags({
        order: 1,
        exerciseId: 'cat-cow',
        set: { type: 'reps', sets: 1, reps: '6-8 cycles' },
        restSeconds: 15,
        note: 'Match the movement to easy breathing.',
      }),
      withLimitationTags({
        order: 2,
        exerciseId: 'hip-hinge',
        set: { type: 'reps', sets: 1, reps: '8' },
        restSeconds: 20,
        note: 'Treat this as practice, not a strength set.',
      }),
      withLimitationTags({
        order: 3,
        exerciseId: 'standing-hamstring-walkout',
        set: { type: 'reps', sets: 1, reps: '4 cycles' },
        restSeconds: 30,
        note: 'Bend the knees as much as needed on the way down.',
      }),
      withLimitationTags({
        order: 4,
        exerciseId: 'glute-bridge',
        set: { type: 'reps', sets: 1, reps: '10' },
        restSeconds: 20,
        note: 'Lift only to a range that feels smooth.',
      }),
      withLimitationTags({
        order: 5,
        exerciseId: 'bird-dog',
        set: { type: 'reps', sets: 1, reps: '6 per side' },
        restSeconds: 30,
        note: 'Reach long without twisting through the torso.',
      }),
      withLimitationTags({
        order: 6,
        exerciseId: 'wall-press',
        set: { type: 'reps', sets: 1, reps: '10' },
        restSeconds: 20,
        note: 'Use this as a light shoulder warm-up.',
      }),
    ],
  }),
  createWorkoutDetail('quick-core-15', {
    coachNote:
      'Breathe through every hold and keep the work controlled. Rest early if your position changes or anything feels off.',
    primaryMusclesWorked: ['core'],
    secondaryMusclesWorked: ['shoulders', 'back', 'glutes'],
    exerciseSequence: [
      withLimitationTags({
        order: 1,
        exerciseId: 'plank',
        set: { type: 'timed', sets: 3, seconds: 30 },
        restSeconds: 45,
        note: 'Keep the hips level and breathe steadily.',
      }),
      withLimitationTags({
        order: 2,
        exerciseId: 'dead-bug',
        set: { type: 'reps', sets: 3, reps: '6 per side' },
        restSeconds: 30,
        note: 'Move slowly enough that your ribs stay quiet.',
      }),
      withLimitationTags({
        order: 3,
        exerciseId: 'bird-dog',
        set: { type: 'reps', sets: 3, reps: '6 per side' },
        restSeconds: 30,
        note: 'Pause briefly with the arm and leg extended.',
      }),
      withLimitationTags({
        order: 4,
        exerciseId: 'shoulder-taps',
        set: { type: 'reps', sets: 2, reps: '6 per side' },
        restSeconds: 45,
        note: 'Use a wider foot stance if the hips start to rock.',
      }),
      withLimitationTags({
        order: 5,
        exerciseId: 'glute-bridge',
        set: { type: 'reps', sets: 2, reps: '12' },
        restSeconds: 30,
        note: 'Finish by resetting the hips with smooth reps.',
      }),
    ],
  }),
  createWorkoutDetail('full-body-flow', {
    coachNote:
      'This one moves through the whole body, so keep transitions calm. Rest between sets and let smooth form matter more than speed.',
    primaryMusclesWorked: ['full_body'],
    secondaryMusclesWorked: ['legs', 'glutes', 'core', 'chest', 'shoulders', 'back'],
    exerciseSequence: [
      withLimitationTags({
        order: 1,
        exerciseId: 'standing-hamstring-walkout',
        set: { type: 'reps', sets: 2, reps: '4 cycles' },
        restSeconds: 30,
        note: 'Warm up the hinge and plank shapes before strength work.',
      }),
      withLimitationTags({
        order: 2,
        exerciseId: 'bodyweight-squat',
        set: { type: 'reps', sets: 3, reps: '8' },
        restSeconds: 45,
        note: 'Choose a depth you can repeat consistently.',
      }),
      withLimitationTags({
        order: 3,
        exerciseId: 'incline-push-up',
        set: { type: 'reps', sets: 3, reps: '6' },
        restSeconds: 45,
        note: 'Keep one straight line from head to heels.',
      }),
      withLimitationTags({
        order: 4,
        exerciseId: 'glute-bridge',
        set: { type: 'reps', sets: 3, reps: '10' },
        restSeconds: 30,
        note: 'Squeeze at the top and lower without rushing.',
      }),
      withLimitationTags({
        order: 5,
        exerciseId: 'plank',
        set: { type: 'timed', sets: 3, seconds: 25 },
        restSeconds: 45,
        note: 'Use knees-down planks if that helps you keep control.',
      }),
      withLimitationTags({
        order: 6,
        exerciseId: 'reverse-lunge',
        set: { type: 'reps', sets: 2, reps: '6 per side' },
        restSeconds: 45,
        note: 'Step back softly and stand through the front foot.',
      }),
      withLimitationTags({
        order: 7,
        exerciseId: 'bird-dog',
        set: { type: 'reps', sets: 2, reps: '8 per side' },
        restSeconds: 30,
        note: 'Finish with slow reaches and a quiet torso.',
      }),
    ],
  }),
  createWorkoutDetail('hip-mobility-flow', {
    coachNote:
      'Keep the range gentle and repeatable. This Pro-tagged workout is static catalog content; real subscription access arrives later.',
    primaryMusclesWorked: ['hips', 'glutes'],
    secondaryMusclesWorked: ['back', 'core', 'legs'],
    exerciseSequence: [
      withLimitationTags({
        order: 1,
        exerciseId: 'cat-cow',
        set: { type: 'reps', sets: 1, reps: '8 cycles' },
        restSeconds: 15,
        note: 'Start by finding easy motion through the spine.',
      }),
      withLimitationTags({
        order: 2,
        exerciseId: 'hip-hinge',
        set: { type: 'reps', sets: 2, reps: '8' },
        restSeconds: 30,
        note: 'Keep the hips moving back instead of dropping down.',
      }),
      withLimitationTags({
        order: 3,
        exerciseId: 'standing-hamstring-walkout',
        set: { type: 'reps', sets: 2, reps: '4 cycles' },
        restSeconds: 30,
        note: 'Walk only as far as your position stays controlled.',
      }),
      withLimitationTags({
        order: 4,
        exerciseId: 'glute-bridge',
        set: { type: 'reps', sets: 2, reps: '12' },
        restSeconds: 30,
        note: 'Drive evenly through both feet.',
      }),
      withLimitationTags({
        order: 5,
        exerciseId: 'reverse-lunge',
        set: { type: 'reps', sets: 2, reps: '5 per side' },
        restSeconds: 45,
        note: 'Use a short step and a small range if needed.',
      }),
    ],
  }),
  createWorkoutDetail('core-and-control', {
    coachNote:
      'This is deliberate core practice. Take longer rests if needed and keep every rep slow enough to stay steady.',
    primaryMusclesWorked: ['core'],
    secondaryMusclesWorked: ['shoulders', 'back', 'glutes'],
    exerciseSequence: [
      withLimitationTags({
        order: 1,
        exerciseId: 'plank',
        set: { type: 'timed', sets: 3, seconds: 35 },
        restSeconds: 45,
        note: 'Make the hold quiet before adding harder variations.',
      }),
      withLimitationTags({
        order: 2,
        exerciseId: 'dead-bug',
        set: { type: 'reps', sets: 3, reps: '8 per side' },
        restSeconds: 30,
        note: 'Extend only as far as your brace stays consistent.',
      }),
      withLimitationTags({
        order: 3,
        exerciseId: 'bird-dog',
        set: { type: 'reps', sets: 3, reps: '8 per side' },
        restSeconds: 30,
        note: 'Reach long and pause before returning.',
      }),
      withLimitationTags({
        order: 4,
        exerciseId: 'shoulder-taps',
        set: { type: 'reps', sets: 3, reps: '8 per side' },
        restSeconds: 45,
        note: 'Move slowly enough that the hips do not sway.',
      }),
      withLimitationTags({
        order: 5,
        exerciseId: 'glute-bridge',
        set: { type: 'reps', sets: 2, reps: '15' },
        restSeconds: 30,
        note: 'Use this to reset the hips after bracing work.',
      }),
      withLimitationTags({
        order: 6,
        exerciseId: 'standing-hamstring-walkout',
        set: { type: 'reps', sets: 2, reps: '5 cycles' },
        restSeconds: 45,
        note: 'Walk out and back with control rather than speed.',
      }),
    ],
  }),
  createWorkoutDetail('evening-wind-down', {
    coachNote:
      'Keep this light and unhurried. The goal is to finish feeling calmer, so skip anything that does not feel right today.',
    primaryMusclesWorked: ['full_body'],
    secondaryMusclesWorked: ['hips', 'back', 'core', 'glutes'],
    exerciseSequence: [
      withLimitationTags({
        order: 1,
        exerciseId: 'cat-cow',
        set: { type: 'reps', sets: 1, reps: '8 cycles' },
        restSeconds: 15,
        note: 'Let each breath guide one smooth cycle.',
      }),
      withLimitationTags({
        order: 2,
        exerciseId: 'glute-bridge',
        set: { type: 'reps', sets: 1, reps: '10' },
        restSeconds: 20,
        note: 'Move gently and avoid forcing the top position.',
      }),
      withLimitationTags({
        order: 3,
        exerciseId: 'dead-bug',
        set: { type: 'reps', sets: 1, reps: '6 per side' },
        restSeconds: 20,
        note: 'Use a short range and steady breathing.',
      }),
      withLimitationTags({
        order: 4,
        exerciseId: 'hip-hinge',
        set: { type: 'reps', sets: 1, reps: '8' },
        restSeconds: 20,
        note: 'Finish tall and relaxed after each rep.',
      }),
    ],
  }),
];

/**
 * Look up a single workout by id. Returns `undefined` when the id
 * does not exist in the catalog — callers must handle that case
 * honestly (e.g. show a "not found" path).
 */
export function findWorkoutById(id: string): WorkoutSummary | undefined {
  return WORKOUT_CATALOG.find((workout) => workout.id === id);
}

/** Look up a single exercise by id. */
export function findExerciseById(id: string): ExerciseSummary | undefined {
  return EXERCISE_CATALOG.find((exercise) => exercise.id === id);
}

/** Look up the Phase 15 detail record for a workout id. */
export function findWorkoutDetailById(id: string): WorkoutDetail | undefined {
  return WORKOUT_DETAIL_CATALOG.find((workout) => workout.id === id);
}

/** Return the ordered exercise sequence for a workout detail, if present. */
export function findWorkoutExerciseSequence(
  id: string,
): ReadonlyArray<WorkoutExerciseSequenceItem> | undefined {
  return findWorkoutDetailById(id)?.exerciseSequence;
}
