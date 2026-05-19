import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@utils/cn';

type InputOwnProps = {
  /** Visible field label. Always render a label. */
  label: ReactNode;
  /** Optional helper text shown below the field in the default state. */
  helperText?: ReactNode;
  /** Error message. Presence flips the field into the invalid state. */
  error?: ReactNode;
  /** Mark the field as required (renders a non-color "required" hint). */
  required?: boolean;
  /** Stretch the field to fill its parent. */
  fullWidth?: boolean;
  /**
   * When `type === 'password'`, render a visibility toggle next to the
   * input. Defaults to `true`. Ignored for non-password fields.
   */
  withPasswordToggle?: boolean;
};

export type InputProps = InputOwnProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, keyof InputOwnProps>;

const FIELD_BASE =
  'block w-full rounded-xl border bg-motionly-bg-light px-3 py-2 text-body text-motionly-neutral-900 ' +
  'transition-colors duration-150 placeholder:text-motionly-neutral-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-motionly-primary focus:ring-offset-2 ' +
  'focus:ring-offset-motionly-bg-light dark:focus:ring-offset-motionly-bg-dark ' +
  'disabled:cursor-not-allowed disabled:opacity-60 ' +
  'dark:bg-motionly-bg-dark dark:text-motionly-neutral-50 dark:placeholder:text-motionly-neutral-500';

const FIELD_DEFAULT_BORDER =
  'border-motionly-neutral-300 hover:border-motionly-neutral-400 ' +
  'dark:border-motionly-neutral-700 dark:hover:border-motionly-neutral-600';

const FIELD_ERROR_BORDER =
  'border-motionly-danger hover:border-motionly-danger dark:border-motionly-danger';

const REQUIRED_HINT_CLASS =
  'ml-1 text-caption text-motionly-neutral-500 dark:text-motionly-neutral-400';

/**
 * Motionly text input primitive.
 *
 * Bundles a visible `label`, optional `helperText`, and an `error` slot
 * with the correct accessibility wiring:
 * - `label[for]` ↔ `input[id]` association.
 * - `aria-describedby` points to helper / error nodes when present.
 * - `aria-invalid` is set when `error` is provided.
 *
 * Variants / states:
 * - default (with optional helper text)
 * - invalid (error message shown; non-color signal via icon-free copy)
 * - disabled (visual opacity + native `disabled` semantics)
 * - password (built-in show/hide toggle via lucide `Eye` / `EyeOff`)
 *
 * Accessibility:
 * - The label is **required** — Motionly never renders unlabeled fields.
 * - Error and helper text are exposed to assistive tech via
 *   `aria-describedby`, not just visual proximity.
 * - The required hint is text-based, not color-only.
 * - The password toggle is a `<button type="button">` with an explicit
 *   `aria-label` that flips between "Show password" / "Hide password".
 *
 * Not for:
 * - Form submission orchestration, validation rules, or auth logic.
 *   `Input` is purely presentational; wire submission and validation in
 *   the page that owns the form.
 * - Multi-line text. Use a future `Textarea` primitive (not in Phase 8).
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    helperText,
    error,
    required = false,
    fullWidth = true,
    withPasswordToggle = true,
    id,
    type = 'text',
    className,
    disabled,
    'aria-describedby': describedByProp,
    ...rest
  },
  ref,
): JSX.Element {
  const reactId = useId();
  const inputId = id ?? `input-${reactId}`;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword && revealed ? 'text' : type;
  const showPasswordToggle = isPassword && withPasswordToggle;

  const describedBy =
    [describedByProp, errorId, helperId]
      .filter((value): value is string => Boolean(value))
      .join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth ? 'w-full' : 'w-fit')}>
      <label
        htmlFor={inputId}
        className="text-label text-motionly-neutral-800 dark:text-motionly-neutral-200"
      >
        {label}
        {required ? (
          <span className={REQUIRED_HINT_CLASS} aria-hidden="true">
            (required)
          </span>
        ) : null}
      </label>

      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            FIELD_BASE,
            error ? FIELD_ERROR_BORDER : FIELD_DEFAULT_BORDER,
            showPasswordToggle && 'pr-11',
            className,
          )}
          {...rest}
        />

        {showPasswordToggle ? (
          <button
            type="button"
            onClick={() => setRevealed((prev) => !prev)}
            disabled={disabled}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            className={cn(
              'absolute inset-y-0 right-0 flex h-full w-11 items-center justify-center rounded-r-xl',
              'text-motionly-neutral-500 hover:text-motionly-neutral-900',
              'dark:text-motionly-neutral-400 dark:hover:text-motionly-neutral-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-motionly-primary',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            {revealed ? (
              <EyeOff aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Eye aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className="text-caption text-motionly-danger">
          {error}
        </p>
      ) : helperText ? (
        <p
          id={helperId}
          className="text-caption text-motionly-neutral-500 dark:text-motionly-neutral-400"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
