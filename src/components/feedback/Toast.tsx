import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle, type LucideIcon } from 'lucide-react';

import { Icon } from '@components/primitives';
import { cn } from '@utils/cn';

/**
 * Tone of a toast notification. Maps to Motionly token classes.
 *
 * - `info`    — neutral informational message.
 * - `success` — confirmation after a user action.
 * - `warning` — non-blocking caution (e.g. "Offline mode").
 * - `error`   — something failed; pair with a retry affordance.
 */
export type ToastTone = 'info' | 'success' | 'warning' | 'error';

/** Default dismiss duration per tone (ms). `0` means "never auto-dismiss". */
const DEFAULT_DURATION_MS: Record<ToastTone, number> = {
  info: 4_000,
  success: 3_500,
  warning: 5_000,
  error: 6_000,
};

/**
 * Single toast entry. `id` is assigned by `useToast()`. `title` and
 * `message` are caller-provided — the system never invents copy.
 */
export type Toast = {
  id: string;
  tone: ToastTone;
  title?: string;
  message: string;
  /** Duration in milliseconds. `0` keeps the toast until dismissed. */
  durationMs: number;
};

export type ShowToastInput = {
  /** Defaults to `info`. */
  tone?: ToastTone;
  title?: string;
  message: string;
  /** Override the default duration for this toast. */
  durationMs?: number;
};

type ToastContextValue = {
  toasts: ReadonlyArray<Toast>;
  show: (input: ShowToastInput) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_ICON: Record<ToastTone, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const TONE_ICON_TONE: Record<ToastTone, 'muted' | 'accent' | 'warning' | 'danger'> = {
  info: 'muted',
  success: 'accent',
  warning: 'warning',
  error: 'danger',
};

const TONE_WRAPPER_CLASS: Record<ToastTone, string> = {
  info:
    'bg-motionly-neutral-50 ring-1 ring-motionly-neutral-200 text-motionly-neutral-900 ' +
    'dark:bg-motionly-neutral-900 dark:ring-motionly-neutral-700 dark:text-motionly-neutral-50',
  success:
    'bg-motionly-accent/10 ring-1 ring-motionly-accent/30 text-motionly-neutral-900 ' +
    'dark:text-motionly-neutral-50',
  warning:
    'bg-motionly-warning/10 ring-1 ring-motionly-warning/30 text-motionly-neutral-900 ' +
    'dark:text-motionly-neutral-50',
  error:
    'bg-motionly-danger/10 ring-1 ring-motionly-danger/40 text-motionly-neutral-900 ' +
    'dark:text-motionly-neutral-50',
};

/**
 * Politeness of the toast viewport's `aria-live` region per tone.
 *
 * Errors deserve `assertive` so users hear them immediately;
 * everything else stays `polite`.
 */
function ariaLiveForTone(tone: ToastTone): 'polite' | 'assertive' {
  return tone === 'error' ? 'assertive' : 'polite';
}

/**
 * Motionly toast provider.
 *
 * Wrap the app root (or any subtree that needs toasts) with
 * `ToastProvider`. The provider owns the toast queue, the auto-dismiss
 * timers, and renders `ToastViewport` automatically at the bottom of
 * the subtree.
 *
 * The provider is an in-house implementation — there is **no**
 * third-party toast dependency. Future product code calls
 * `useToast()` and gets a fully-typed Motionly API.
 *
 * The provider does **not** show fake notifications, does **not**
 * implement Web Push, and is unrelated to the Phase 44 push
 * notification work.
 */
export function ToastProvider({ children }: { children: ReactNode }): JSX.Element {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const show = useCallback((input: ShowToastInput): string => {
    const tone = input.tone ?? 'info';
    idCounterRef.current += 1;
    const id = `motionly-toast-${idCounterRef.current}`;
    const toast: Toast = {
      id,
      tone,
      title: input.title,
      message: input.message,
      durationMs: input.durationMs ?? DEFAULT_DURATION_MS[tone],
    };
    setToasts((current) => [...current, toast]);
    return id;
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, show, dismiss, dismissAll }),
    [toasts, show, dismiss, dismissAll],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}

/**
 * Hook returning the toast API.
 *
 * @example
 *   const { show } = useToast();
 *   show({ tone: 'success', message: 'Workout saved.' });
 */
export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (value === null) {
    throw new Error('useToast() must be used inside a <ToastProvider>.');
  }
  return value;
}

type ToastItemProps = {
  toast: Toast;
  onDismiss: (id: string) => void;
};

function ToastItem({ toast, onDismiss }: ToastItemProps): JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const IconComponent = TONE_ICON[toast.tone];
  const labelId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (toast.durationMs <= 0) {
      return undefined;
    }
    const handle = window.setTimeout(() => onDismiss(toast.id), toast.durationMs);
    return () => window.clearTimeout(handle);
  }, [toast.durationMs, toast.id, onDismiss]);

  const initial = prefersReducedMotion === true ? { opacity: 0 } : { opacity: 0, y: 12 };
  const animate = prefersReducedMotion === true ? { opacity: 1 } : { opacity: 1, y: 0 };
  const exit = prefersReducedMotion === true ? { opacity: 0 } : { opacity: 0, y: 12 };

  return (
    <motion.li
      layout
      initial={initial}
      animate={animate}
      exit={exit}
      transition={{ duration: prefersReducedMotion === true ? 0 : 0.2, ease: 'easeOut' }}
      aria-labelledby={toast.title ? labelId : undefined}
      aria-describedby={descriptionId}
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-2xl px-4 py-3 shadow-md backdrop-blur',
        TONE_WRAPPER_CLASS[toast.tone],
      )}
    >
      <Icon icon={IconComponent} tone={TONE_ICON_TONE[toast.tone]} label="Notification" />
      <div className="flex flex-1 flex-col gap-0.5">
        {toast.title ? (
          <span id={labelId} className="text-label font-semibold">
            {toast.title}
          </span>
        ) : null}
        <span id={descriptionId} className="text-body leading-snug">
          {toast.message}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className={cn(
          'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          'text-motionly-neutral-600 hover:bg-motionly-neutral-200/60',
          'dark:text-motionly-neutral-300 dark:hover:bg-motionly-neutral-800/80',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-motionly-primary',
        )}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </motion.li>
  );
}

/**
 * Renders the active toasts. `ToastProvider` mounts this automatically;
 * exported separately so callers who want to host the viewport in a
 * specific place (e.g. above a fixed bottom tab bar) can opt out by
 * wrapping their own subtree.
 *
 * Accessibility:
 * - The viewport is split into two `aria-live` regions — `polite` for
 *   info / success / warning, `assertive` for errors — so the screen
 *   reader announcement priority matches the tone.
 */
export function ToastViewport(): JSX.Element | null {
  const context = useContext(ToastContext);
  if (context === null) {
    return null;
  }
  const { toasts, dismiss } = context;
  const politeToasts = toasts.filter((toast) => ariaLiveForTone(toast.tone) === 'polite');
  const assertiveToasts = toasts.filter((toast) => ariaLiveForTone(toast.tone) === 'assertive');

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 mx-auto flex max-w-md flex-col gap-2 px-4"
      aria-label="Notifications"
    >
      <ul
        role="status"
        aria-live="polite"
        aria-relevant="additions"
        className="flex flex-col gap-2"
      >
        <AnimatePresence initial={false}>
          {politeToasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </ul>
      <ul
        role="alert"
        aria-live="assertive"
        aria-relevant="additions"
        className="flex flex-col gap-2"
      >
        <AnimatePresence initial={false}>
          {assertiveToasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
