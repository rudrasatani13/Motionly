import { SearchX } from 'lucide-react';

import { Button, Icon } from '@components/primitives';
import { EmptyState } from '@components/feedback';

type LibraryEmptyStateProps = {
  /** Heading for the empty state. */
  title: string;
  /** Optional description below the title. */
  description?: string;
  /** Reset-filters callback. */
  onReset: () => void;
};

/**
 * Phase 14 — Honest empty state for the library when no workouts
 * or exercises match the current filter/search combination.
 *
 * Uses the Phase 9 `EmptyState` primitive with a token-coded
 * illustration and a reset CTA — never fabricates results.
 */
export function LibraryEmptyState({
  title,
  description,
  onReset,
}: LibraryEmptyStateProps): JSX.Element {
  return (
    <EmptyState
      title={title}
      description={description}
      headingAs="h3"
      illustration={<Icon icon={SearchX} size="xl" tone="muted" />}
      action={
        <Button variant="primary" onClick={onReset}>
          Clear filters
        </Button>
      }
    />
  );
}
