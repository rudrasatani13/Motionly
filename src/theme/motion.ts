export const motionDurations = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

export const motionEasings = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.16, 1, 0.3, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

export const reducedMotion = {
  duration: motionDurations.instant,
  transitionProperty: 'none',
} as const;
