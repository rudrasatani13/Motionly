import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

import { triggerLightHaptic } from '@platform/haptics';
import { cn } from '@utils/cn';

/**
 * Visual intent of a `Button`. Maps to Motionly token classes — never
 * hardcoded hex colors.
 *
 * - `primary` — the single most important action on the screen. Use at
 *   most one per view.
 * - `secondary` — an action of equal importance but not the headline
 *   CTA (e.g. "Cancel" next to "Save").
 * - `ghost` — low-emphasis action that should not compete for
 *   attention; tertiary navigation, dismiss, "Maybe later".
 * - `danger` — destructive action (delete, sign out). Pair with a
 *   confirmation pattern; do not use for "submit".
 * - `icon` — square icon-only button. **Caller must pass `aria-label`**.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';

/**
 * Size of the button. `md` is the default and targets a ~44px touch
 * target on touch devices.
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonOwnProps = {
  /** Visual intent. Defaults to `primary`. */
  variant?: ButtonVariant;
  /** Size token. Defaults to `md`. */
  size?: ButtonSize;
  /** Stretch to the width of the parent. */
  fullWidth?: boolean;
  /** Show a loading spinner and set `aria-busy`; disables click. */
  loading?: boolean;
  /** Optional label announced/visualized while `loading` is true. */
  loadingLabel?: string;
  /** Optional leading icon (decorative; `aria-hidden` is applied). */
  leftIcon?: ReactNode;
  /** Optional trailing icon (decorative; `aria-hidden` is applied). */
  rightIcon?: ReactNode;
  /**
   * Trigger a short haptic pulse on press (Android Chrome via the
   * `@platform/haptics` adapter). Defaults to `false`. Adapter no-ops
   * safely where the API is unsupported.
   */
  haptic?: boolean;
  /** Button label / children. Required for non-`icon` variants. */
  children?: ReactNode;
};

export type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps>;

const BASE_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-xl font-sans text-label font-medium ' +
  'transition-colors duration-150 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-motionly-primary focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-motionly-bg-light dark:focus-visible:ring-offset-motionly-bg-dark ' +
  'disabled:cursor-not-allowed disabled:opacity-60 ' +
  'select-none';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'bg-motionly-primary text-white hover:bg-motionly-primary/90 active:bg-motionly-primary/80 ' +
    'disabled:hover:bg-motionly-primary',
  secondary:
    'border border-motionly-neutral-300 bg-motionly-bg-light text-motionly-neutral-900 ' +
    'hover:bg-motionly-neutral-100 active:bg-motionly-neutral-200 ' +
    'dark:border-motionly-neutral-700 dark:bg-motionly-bg-dark dark:text-motionly-neutral-50 ' +
    'dark:hover:bg-motionly-neutral-900 dark:active:bg-motionly-neutral-800',
  ghost:
    'bg-transparent text-motionly-neutral-900 hover:bg-motionly-neutral-100 active:bg-motionly-neutral-200 ' +
    'dark:text-motionly-neutral-50 dark:hover:bg-motionly-neutral-900 dark:active:bg-motionly-neutral-800',
  danger:
    'bg-motionly-danger text-white hover:bg-motionly-danger/90 active:bg-motionly-danger/80 ' +
    'disabled:hover:bg-motionly-danger',
  icon:
    'bg-transparent text-motionly-neutral-700 hover:bg-motionly-neutral-100 active:bg-motionly-neutral-200 ' +
    'dark:text-motionly-neutral-200 dark:hover:bg-motionly-neutral-900 dark:active:bg-motionly-neutral-800',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-caption',
  md: 'h-11 px-4',
  lg: 'h-12 px-5 text-body',
};

const ICON_SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-9 w-9 p-0',
  md: 'h-11 w-11 p-0',
  lg: 'h-12 w-12 p-0',
};

const SPINNER_SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

/**
 * Motionly primary action primitive.
 *
 * `Button` is the canonical clickable surface used across the app. It
 * supports five visual variants, three sizes, leading / trailing icons,
 * a `loading` state with `aria-busy`, optional `haptic` feedback on
 * press, and ships with a visible focus ring honoring the global
 * `:focus-visible` token.
 *
 * Accessibility:
 * - Default `type` is `button` so the component never accidentally
 *   submits a form. Pass `type="submit"` explicitly when needed.
 * - When `variant="icon"` the caller **must** supply `aria-label`. The
 *   `leftIcon` / `rightIcon` slots are marked `aria-hidden` because the
 *   accessible name is expected to come from the text label or
 *   `aria-label`.
 * - When `loading` is true the button is disabled and announced via
 *   `aria-busy`. The visible label is replaced with `loadingLabel` if
 *   provided, otherwise the spinner sits alongside the original
 *   children so layout does not jump.
 *
 * Privacy / fake-data rules:
 * - No fake stats, fake user data, or fake AI feedback should be
 *   passed as children; this primitive is purely presentational.
 *
 * Not for:
 * - Navigation `<a>` semantics — wrap with React Router's `Link`
 *   externally, or build a dedicated link primitive in a later phase.
 * - Long-running progress UI; the loading spinner is a short-term
 *   "request in flight" affordance. `LinearProgress` /
 *   `CircularProgress` arrive in Phase 9.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    loadingLabel,
    leftIcon,
    rightIcon,
    haptic = false,
    type,
    disabled,
    className,
    onClick,
    children,
    ...rest
  },
  ref,
): JSX.Element {
  const isDisabled = disabled === true || loading;

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (haptic && !isDisabled) {
      triggerLightHaptic();
    }
    onClick?.(event);
  };

  const sizeClass = variant === 'icon' ? ICON_SIZE_CLASS[size] : SIZE_CLASS[size];

  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        BASE_CLASS,
        VARIANT_CLASS[variant],
        sizeClass,
        fullWidth && 'w-full',
        className,
      )}
      onClick={handleClick}
      {...rest}
    >
      {loading ? (
        <Loader2
          aria-hidden="true"
          className={cn(SPINNER_SIZE_CLASS[size], 'animate-spin motion-reduce:animate-none')}
        />
      ) : leftIcon ? (
        <span aria-hidden="true" className="inline-flex shrink-0 items-center">
          {leftIcon}
        </span>
      ) : null}
      {loading && loadingLabel ? (
        <span>{loadingLabel}</span>
      ) : variant === 'icon' ? null : (
        <span className="inline-flex items-center">{children}</span>
      )}
      {!loading && rightIcon ? (
        <span aria-hidden="true" className="inline-flex shrink-0 items-center">
          {rightIcon}
        </span>
      ) : null}
      {variant === 'icon' && !loading ? children : null}
    </button>
  );
});
