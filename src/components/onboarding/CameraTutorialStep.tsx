import { Camera, Maximize, MapPin, Sun } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import type { CameraPermissionStatus } from '@/types/onboarding';
import { Column, Heading, Icon, Text } from '@components/primitives';
import { cn } from '@utils/cn';

type CameraTutorialStepProps = {
  headingId: string;
  cameraPermissionStatus: CameraPermissionStatus;
  cameraPermissionErrorMessage: string | null;
  isCompleting: boolean;
  onContinueWithoutCamera: () => void;
};

type TutorialPoint = {
  icon: typeof MapPin;
  title: string;
  description: string;
};

const TUTORIAL_POINTS: TutorialPoint[] = [
  {
    icon: MapPin,
    title: 'Place your phone 2–3 meters away',
    description: 'Prop it up so the lens is at hip height.',
  },
  {
    icon: Maximize,
    title: 'Make sure your full body is visible',
    description: 'Head, hands, and feet should all be in the frame.',
  },
  {
    icon: Sun,
    title: 'Good lighting = better coaching',
    description: 'Face the brightest light source; avoid strong backlight.',
  },
];

function statusMessage(
  status: CameraPermissionStatus,
  errorMessage: string | null,
): { tone: 'info' | 'success' | 'warning' | 'danger'; copy: string } | null {
  switch (status) {
    case 'idle':
      return null;
    case 'requesting':
      return { tone: 'info', copy: 'Asking your browser for camera permission…' };
    case 'granted':
      return {
        tone: 'success',
        copy: 'Camera permission granted. Wrapping up onboarding…',
      };
    case 'denied':
      return {
        tone: 'warning',
        copy: 'Camera access was blocked. Open your browser site settings to allow camera, then tap Try again.',
      };
    case 'unavailable':
      return {
        tone: 'warning',
        copy: 'No camera was detected on this device, or this page is not running on a secure connection (HTTPS or localhost). You can still continue.',
      };
    case 'error':
      return {
        tone: 'danger',
        copy: errorMessage ?? 'Something went wrong asking for camera permission.',
      };
    default:
      return null;
  }
}

function statusToneClasses(tone: 'info' | 'success' | 'warning' | 'danger'): string {
  switch (tone) {
    case 'success':
      return 'border-motionly-primary/40 bg-motionly-primary/10 text-motionly-primary';
    case 'warning':
      return 'border-motionly-warning/40 bg-motionly-warning/10 text-motionly-warning';
    case 'danger':
      return 'border-motionly-danger/40 bg-motionly-danger/10 text-motionly-danger';
    case 'info':
    default:
      return 'border-motionly-neutral-200 bg-motionly-neutral-100 text-motionly-neutral-700 dark:border-motionly-neutral-800 dark:bg-motionly-neutral-900 dark:text-motionly-neutral-200';
  }
}

export function CameraTutorialStep({
  headingId,
  cameraPermissionStatus,
  cameraPermissionErrorMessage,
  isCompleting,
  onContinueWithoutCamera,
}: CameraTutorialStepProps): JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const status = statusMessage(cameraPermissionStatus, cameraPermissionErrorMessage);
  const showSecondaryAction =
    cameraPermissionStatus === 'denied' ||
    cameraPermissionStatus === 'unavailable' ||
    cameraPermissionStatus === 'error';

  return (
    <Column gap="lg" className="flex-1">
      <Column gap="sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-motionly-primary/30 bg-motionly-primary/10 text-motionly-primary">
          <Icon icon={Camera} size="lg" />
        </div>
        <Heading id={headingId} level={1}>
          Set up your camera safely.
        </Heading>
        <Text tone="muted">
          Motionly needs camera permission to analyze your movement in later workouts. Video is
          processed on your device and never uploaded. You can change this in your browser settings
          anytime.
        </Text>
      </Column>

      <ol className="flex flex-col gap-3">
        {TUTORIAL_POINTS.map((point, index) => (
          <motion.li
            key={point.title}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.24,
              delay: prefersReducedMotion ? 0 : index * 0.06,
              ease: [0.2, 0, 0, 1],
            }}
            className="flex items-start gap-3 rounded-2xl border border-motionly-neutral-200 bg-motionly-neutral-50 px-4 py-3 dark:border-motionly-neutral-800 dark:bg-motionly-neutral-900"
          >
            <span
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-motionly-primary/10 text-motionly-primary"
              aria-hidden="true"
            >
              <Icon icon={point.icon} size="md" />
            </span>
            <span className="flex flex-1 flex-col gap-1">
              <Text as="span" variant="label">
                {point.title}
              </Text>
              <Text as="span" variant="caption" tone="muted">
                {point.description}
              </Text>
            </span>
            <span
              className="text-caption font-medium text-motionly-neutral-500 dark:text-motionly-neutral-400"
              aria-hidden="true"
            >
              {index + 1}
            </span>
          </motion.li>
        ))}
      </ol>

      {status !== null ? (
        <p
          role={status.tone === 'danger' || status.tone === 'warning' ? 'alert' : 'status'}
          aria-live={status.tone === 'danger' || status.tone === 'warning' ? 'assertive' : 'polite'}
          className={cn(
            'rounded-2xl border px-4 py-3 text-caption font-medium',
            statusToneClasses(status.tone),
          )}
        >
          {status.copy}
        </p>
      ) : null}

      {showSecondaryAction ? (
        <button
          type="button"
          onClick={onContinueWithoutCamera}
          disabled={isCompleting}
          aria-disabled={isCompleting}
          className={cn(
            'mx-auto inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-label font-medium',
            'text-motionly-neutral-700 underline-offset-4 hover:underline active:bg-motionly-neutral-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-motionly-primary focus-visible:ring-offset-2',
            'focus-visible:ring-offset-motionly-bg-light dark:focus-visible:ring-offset-motionly-bg-dark',
            'disabled:cursor-not-allowed disabled:opacity-60',
            'dark:text-motionly-neutral-200 dark:active:bg-motionly-neutral-900',
          )}
        >
          Continue without camera for now
        </button>
      ) : null}

      <Text variant="caption" tone="subtle" className="mt-auto">
        Workouts that need the camera will ask for permission again later if you skip this step.
        Motionly never stores or uploads camera frames.
      </Text>
    </Column>
  );
}
