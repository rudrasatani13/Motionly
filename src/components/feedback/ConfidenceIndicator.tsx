import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';

import { Icon } from '@components/primitives';
import { cn } from '@utils/cn';

/**
 * Confidence variant of the camera / pose pipeline.
 *
 * - `clear`    — pipeline is happy; usually no need to render the
 *                indicator at all, but exposed for completeness.
 * - `checking` — system is warming up or smoothing.
 * - `unclear`  — pipeline detects partial visibility / occlusion;
 *                cues are suppressed (Design Principle "silent on
 *                uncertainty").
 * - `lost`     — body not detected at all; show explicit guidance.
 */
export type ConfidenceStatus = 'clear' | 'checking' | 'unclear' | 'lost';

type ConfidenceIndicatorProps = {
  /** Confidence variant supplied by the caller. */
  status: ConfidenceStatus;
  /**
   * Visible message accompanying the icon. Caller-supplied because
   * the wording depends on context (camera permission flow vs.
   * mid-workout banner). The component never invents a state.
   */
  message: string;
  /**
   * Optional guidance list rendered below the message — short
   * actionable items ("Step back two feet", "Brighten the room").
   * Use plain, encouraging language; never shame the user.
   */
  guidance?: ReadonlyArray<string>;
  /**
   * Show / hide the banner. Defaults to `true` so the caller can
   * conditionally render via prop without unmounting the region.
   */
  visible?: boolean;
  /** Extra utility classes for the outer wrapper. */
  className?: string;
};

const STATUS_ICON: Record<ConfidenceStatus, typeof CheckCircle2> = {
  clear: CheckCircle2,
  checking: Loader2,
  unclear: Eye,
  lost: EyeOff,
};

const STATUS_ICON_TONE: Record<ConfidenceStatus, 'accent' | 'muted' | 'warning' | 'danger'> = {
  clear: 'accent',
  checking: 'muted',
  unclear: 'warning',
  lost: 'danger',
};

const STATUS_WRAPPER_CLASS: Record<ConfidenceStatus, string> = {
  clear:
    'bg-motionly-accent/10 ring-1 ring-motionly-accent/30 text-motionly-neutral-900 ' +
    'dark:text-motionly-neutral-50',
  checking:
    'bg-motionly-neutral-100 ring-1 ring-motionly-neutral-200 text-motionly-neutral-900 ' +
    'dark:bg-motionly-neutral-900 dark:ring-motionly-neutral-700 dark:text-motionly-neutral-50',
  unclear:
    'bg-motionly-warning/10 ring-1 ring-motionly-warning/30 text-motionly-neutral-900 ' +
    'dark:text-motionly-neutral-50',
  lost:
    'bg-motionly-danger/10 ring-1 ring-motionly-danger/40 text-motionly-neutral-900 ' +
    'dark:text-motionly-neutral-50',
};

/**
 * `aria` semantics per status. `lost` is the only state urgent enough
 * to interrupt assistive tech; everything else uses the polite
 * `status` role.
 */
function ariaPropsFor(status: ConfidenceStatus): {
  role: 'status' | 'alert';
  ariaLive: 'polite' | 'assertive';
} {
  if (status === 'lost') {
    return { role: 'alert', ariaLive: 'assertive' };
  }
  return { role: 'status', ariaLive: 'polite' };
}

/**
 * Low-confidence / "camera view unclear" banner.
 *
 * `ConfidenceIndicator` is presentational. The caller (future camera
 * setup screens and the active-workout HUD) decides whether to show
 * the banner based on the pipeline's confidence rating. The component
 * does **not** access the camera, **does not** run any ML, and never
 * fabricates a confidence value.
 *
 * Behavior per Phase 7 low-confidence flow:
 * - When the pipeline is uncertain, the app stays silent on form cues
 *   and surfaces setup guidance via this component instead.
 * - Copy is corrective and short — never shaming, never medical.
 *
 * Accessibility:
 * - `lost` renders as `role="alert"` + `aria-live="assertive"`
 *   because the user needs to know immediately their body is not
 *   visible. All other statuses use `role="status"` +
 *   `aria-live="polite"`.
 * - The `checking` icon's spin honors `prefers-reduced-motion` via
 *   Tailwind's `motion-reduce:animate-none`.
 *
 * Data / fake-data rules:
 * - **Never** invent a confidence reading. If the camera or pipeline
 *   has not produced a value, do not render the component.
 * - **Never** use medical / injury vocabulary in `message` or
 *   `guidance`.
 */
export function ConfidenceIndicator({
  status,
  message,
  guidance,
  visible = true,
  className,
}: ConfidenceIndicatorProps): JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const IconComponent = STATUS_ICON[status];
  const { role, ariaLive } = ariaPropsFor(status);

  const motionInitial = prefersReducedMotion === true ? { opacity: 0 } : { opacity: 0, y: 6 };
  const motionAnimate = prefersReducedMotion === true ? { opacity: 1 } : { opacity: 1, y: 0 };
  const motionExit = prefersReducedMotion === true ? { opacity: 0 } : { opacity: 0, y: -6 };

  return (
    <div className={cn('pointer-events-none', className)}>
      <AnimatePresence initial={false}>
        {visible ? (
          <motion.div
            key={status}
            role={role}
            aria-live={ariaLive}
            aria-atomic="true"
            initial={motionInitial}
            animate={motionAnimate}
            exit={motionExit}
            transition={{ duration: prefersReducedMotion === true ? 0 : 0.2, ease: 'easeOut' }}
            className={cn(
              'pointer-events-auto inline-flex max-w-md items-start gap-3 rounded-2xl px-4 py-3 shadow-sm backdrop-blur',
              STATUS_WRAPPER_CLASS[status],
            )}
          >
            <Icon
              icon={IconComponent}
              tone={STATUS_ICON_TONE[status]}
              label="Camera status"
              className={
                status === 'checking' ? 'animate-spin motion-reduce:animate-none' : undefined
              }
            />
            <div className="flex flex-col gap-1">
              <span className="text-body leading-snug">{message}</span>
              {guidance && guidance.length > 0 ? (
                <ul className="mt-1 list-disc pl-5 text-label text-motionly-neutral-700 dark:text-motionly-neutral-200">
                  {guidance.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
