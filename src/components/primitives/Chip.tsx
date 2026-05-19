import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@utils/cn';

type ChipProps = {
  /** Whether the chip is currently selected. */
  selected?: boolean;
  /** Optional leading visual (icon). */
  leftIcon?: ReactNode;
  /** Children — typically a short label. */
  children?: ReactNode;
  /** Extra utility classes. Do not pass hardcoded colors. */
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

/**
 * Interactive selectable pill.
 *
 * `Chip` is the chip you tap to toggle a filter, choose a limitation
 * during onboarding, or pick one option among many. It always renders
 * as a `<button>` so it is keyboard-focusable and has the correct
 * pressed semantics via `aria-pressed`.
 *
 * Accessibility:
 * - Sets `aria-pressed` to the current `selected` value so assistive
 *   tech announces the toggle state.
 * - Default `type` is `button` so a chip never accidentally submits a
 *   form.
 * - The selected state uses a token-driven tone change **and** a
 *   border treatment — color is not the only signal.
 * - Inherits the global `:focus-visible` outline plus a Tailwind
 *   focus-ring for high-contrast focus indication.
 *
 * Not for:
 * - Pure presentation — use `Tag` if it's not interactive.
 * - One-shot CTAs — use `Button`.
 */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { selected = false, leftIcon, className, type, disabled, children, ...rest },
  ref,
): JSX.Element {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-label font-medium',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-motionly-primary focus-visible:ring-offset-2',
        'focus-visible:ring-offset-motionly-bg-light dark:focus-visible:ring-offset-motionly-bg-dark',
        'disabled:cursor-not-allowed disabled:opacity-60',
        selected
          ? 'border-motionly-primary bg-motionly-primary/10 text-motionly-primary'
          : 'border-motionly-neutral-200 bg-transparent text-motionly-neutral-700 ' +
              'hover:bg-motionly-neutral-100 active:bg-motionly-neutral-200 ' +
              'dark:border-motionly-neutral-800 dark:text-motionly-neutral-200 ' +
              'dark:hover:bg-motionly-neutral-900 dark:active:bg-motionly-neutral-800',
        className,
      )}
      {...rest}
    >
      {leftIcon ? (
        <span aria-hidden="true" className="inline-flex shrink-0 items-center">
          {leftIcon}
        </span>
      ) : null}
      <span>{children}</span>
    </button>
  );
});
