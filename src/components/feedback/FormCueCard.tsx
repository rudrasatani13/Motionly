import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Icon } from '@components/primitives';
import { cn } from '@utils/cn';

/**
 * Tone of a coaching cue card. Only the visual palette changes; copy
 * itself is the caller's responsibility (no medical / injury wording).
 *
 * - `neutral` — informational (e.g. "Step into the frame.").
 * - `success` — sparse positive reinforcement (e.g. "Nice rep.").
 * - `warning` — corrective cue (e.g. "Slow down going down.").
 * - `danger`  — safety-related override (e.g. "Reset your back.").
 */
export type FormCueTone = 'neutral' | 'success' | 'warning' | 'danger';

type FormCueCardProps = {
  /**
   * Cue message text. Must be a short corrective sentence supplied by
   * the future form-engine — never invented inside this component.
   * Maximum length should follow Design Principle 4 ("≤ 6 words")
   * but the component does not truncate; the caller decides.
   */
  message: string;
  /** Tone / palette. Defaults to `warning` (the most common cue type). */
  tone?: FormCueTone;
  /** Optional title rendered above the message. */
  title?: string;
  /** Optional Lucide icon overriding the tone default. */
  icon?: LucideIcon;
  /** Show / hide the card (drives the enter / exit animation). */
  visible?: boolean;
  /**
   * Politeness of the `aria-live` region. `assertive` is appropriate
   * for active mid-workout cues; `polite` is the right default for
   * less time-sensitive guidance (e.g. low-confidence banners). The
   * caller chooses based on context — defaults to `polite`.
   */
  ariaLive?: 'polite' | 'assertive';
  /** Optional click handler for manual dismiss (rare; power-user). */
  onDismiss?: () => void;
  /** Optional extra utility classes. */
  className?: string;
  /** Optional render-slot for additional content (rarely needed). */
  children?: ReactNode;
};

const TONE_ICON: Record<FormCueTone, LucideIcon> = {
  neutral: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertTriangle,
};

const TONE_WRAPPER_CLASS: Record<FormCueTone, string> = {
  neutral:
    'bg-motionly-neutral-50/95 text-motionly-neutral-900 ring-1 ring-motionly-neutral-200 ' +
    'dark:bg-motionly-neutral-900/95 dark:text-motionly-neutral-50 dark:ring-motionly-neutral-700',
  success:
    'bg-motionly-accent/10 text-motionly-neutral-900 ring-1 ring-motionly-accent/30 ' +
    'dark:bg-motionly-accent/15 dark:text-motionly-neutral-50',
  warning:
    'bg-motionly-warning/10 text-motionly-neutral-900 ring-1 ring-motionly-warning/30 ' +
    'dark:bg-motionly-warning/15 dark:text-motionly-neutral-50',
  danger:
    'bg-motionly-danger/10 text-motionly-neutral-900 ring-1 ring-motionly-danger/40 ' +
    'dark:bg-motionly-danger/15 dark:text-motionly-neutral-50',
};

const TONE_ICON_CLASS: Record<FormCueTone, 'muted' | 'accent' | 'warning' | 'danger'> = {
  neutral: 'muted',
  success: 'accent',
  warning: 'warning',
  danger: 'danger',
};

/**
 * Animated coaching cue card used during active workouts.
 *
 * `FormCueCard` is presentational — it does **not** generate, queue,
 * or rank cues. The future form-engine (Phases 21–24) is responsible
 * for choosing the single highest-priority cue. The UI shows exactly
 * one card at a time per Design Principle 4 ("One cue at a time").
 *
 * Animation:
 * - Slide + fade in / out via `framer-motion`'s `AnimatePresence`.
 * - Replacement cues cross-fade naturally because the wrapper keys on
 *   `message`; passing a new message swaps the card.
 * - Honors `prefers-reduced-motion`: the slide is suppressed and only
 *   a gentle opacity transition remains.
 *
 * Accessibility:
 * - Renders as an `aria-live` region. Default politeness is `polite`;
 *   active-workout callers should set `ariaLive="assertive"` so the
 *   cue is announced immediately. The icon's accessible name is the
 *   word "Form cue" so screen readers identify it as guidance, not a
 *   generic alert.
 * - The card is non-interactive by default. `onDismiss` (when passed)
 *   renders the card as a button; otherwise it stays a plain region.
 *
 * Data / safety rules:
 * - **Never** invent a cue. A missing cue means no card.
 * - **Never** use medical / injury vocabulary in `message`.
 * - **Never** stack multiple cards. To replace a cue, pass a new
 *   `message`.
 */
export function FormCueCard({
  message,
  tone = 'warning',
  title,
  icon,
  visible = true,
  ariaLive = 'polite',
  onDismiss,
  className,
  children,
}: FormCueCardProps): JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const IconComponent = icon ?? TONE_ICON[tone];
  const isInteractive = Boolean(onDismiss);

  const motionInitial = prefersReducedMotion === true ? { opacity: 0 } : { opacity: 0, y: 8 };
  const motionAnimate = prefersReducedMotion === true ? { opacity: 1 } : { opacity: 1, y: 0 };
  const motionExit = prefersReducedMotion === true ? { opacity: 0 } : { opacity: 0, y: -8 };

  return (
    <div className={cn('pointer-events-none', className)} aria-live={ariaLive} aria-atomic="true">
      <AnimatePresence mode="wait" initial={false}>
        {visible ? (
          <motion.div
            key={message}
            initial={motionInitial}
            animate={motionAnimate}
            exit={motionExit}
            transition={{ duration: prefersReducedMotion === true ? 0 : 0.2, ease: 'easeOut' }}
            className={cn(
              'pointer-events-auto inline-flex max-w-md items-start gap-3 rounded-2xl px-4 py-3 shadow-sm backdrop-blur',
              TONE_WRAPPER_CLASS[tone],
            )}
            role={isInteractive ? 'button' : 'group'}
            tabIndex={isInteractive ? 0 : undefined}
            onClick={onDismiss}
            onKeyDown={
              isInteractive
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onDismiss?.();
                    }
                  }
                : undefined
            }
          >
            <Icon icon={IconComponent} tone={TONE_ICON_CLASS[tone]} label="Form cue" />
            <div className="flex flex-col">
              {title ? <span className="text-label font-semibold">{title}</span> : null}
              <span className="text-body leading-snug">{message}</span>
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
