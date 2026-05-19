import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button, Card, Heading, Text } from '@components/primitives';
import { cn } from '@utils/cn';

type FallbackRenderProps = {
  /** The error caught by the boundary. */
  error: Error;
  /** Reset the boundary's internal state so children can re-mount. */
  reset: () => void;
};

type ErrorBoundaryProps = {
  /** Application subtree to protect. */
  children: ReactNode;
  /**
   * Optional fallback. When provided, the boundary renders this
   * instead of the default UI. Either a `ReactNode` (static) or a
   * render function receiving `{ error, reset }`.
   */
  fallback?: ReactNode | ((props: FallbackRenderProps) => ReactNode);
  /**
   * Optional error hook called once per caught error. Use it to log
   * to an in-house diagnostic (Phase 53). Does **not** integrate with
   * Sentry or any third-party logging service — those wires belong
   * to later phases.
   */
  onError?: (error: Error, info: ErrorInfo) => void;
  /**
   * Headline rendered in the default fallback UI. Defaults to
   * "Something went wrong."
   */
  title?: string;
  /**
   * Description rendered in the default fallback UI. Defaults to a
   * plain-language message that does not over-claim recovery.
   */
  description?: string;
  /** Optional extra utility classes applied to the default fallback. */
  className?: string;
};

type ErrorBoundaryState = {
  error: Error | null;
};

/**
 * Render-error boundary with a token-themed fallback UI.
 *
 * React requires class components for error boundaries; the rest of
 * the codebase remains function-first. The boundary catches synchronous
 * render errors in its subtree and either renders the supplied
 * `fallback` or a default Motionly-styled message + retry button.
 *
 * Reset behavior:
 * - The default fallback exposes a "Try again" button that clears the
 *   internal error state and re-mounts the protected subtree. Callers
 *   using `fallback` get a `reset` function with the same effect.
 *
 * Logging:
 * - `onError` is the single integration point. The boundary does
 *   **not** send errors to any analytics or crash-reporting service.
 *   Sentry / similar wires are deferred to a later phase.
 *
 * Not for:
 * - Catching asynchronous errors (promise rejections, event handlers).
 *   Those must be handled at the call site — React error boundaries
 *   do not see them.
 * - Suppressing development errors to "polish" the UI; in dev mode the
 *   boundary still surfaces the underlying error message.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  private readonly handleReset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;
    const { children, fallback, title, description, className } = this.props;

    if (error === null) {
      return children;
    }

    if (typeof fallback === 'function') {
      return fallback({ error, reset: this.handleReset });
    }
    if (fallback !== undefined) {
      return fallback;
    }

    return (
      <Card
        variant="outlined"
        padding="lg"
        role="alert"
        className={cn('flex flex-col items-center gap-3 text-center', className)}
      >
        <Heading level={2}>{title ?? 'Something went wrong.'}</Heading>
        <Text tone="muted">
          {description ??
            'An unexpected error broke this section. You can try again — the rest of the app is still running.'}
        </Text>
        <Text tone="subtle" variant="caption">
          {error.message}
        </Text>
        <Button variant="secondary" onClick={this.handleReset}>
          Try again
        </Button>
      </Card>
    );
  }
}
