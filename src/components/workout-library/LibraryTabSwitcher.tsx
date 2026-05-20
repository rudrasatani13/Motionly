import { useCallback, useId, useRef, type KeyboardEvent } from 'react';

import type { LibraryTab } from '@/types/workout-library';
import { cn } from '@utils/cn';

type LibraryTabSwitcherProps = {
  /** Currently-active tab. */
  value: LibraryTab;
  /** Handler invoked when the user picks a tab. */
  onChange: (next: LibraryTab) => void;
  /**
   * IDs of the panels controlled by each tab. The component sets
   * `aria-controls` so screen-reader users can hop straight to the
   * panel content.
   */
  panelIds: { workouts: string; exercises: string };
};

type TabConfig = {
  id: LibraryTab;
  label: string;
};

const TABS: ReadonlyArray<TabConfig> = [
  { id: 'workouts', label: 'Workouts' },
  { id: 'exercises', label: 'Exercises' },
];

/**
 * Phase 14 — Accessible tab switcher for the Workout Library.
 *
 * Implements the WAI-ARIA tablist pattern with arrow-key navigation
 * between tabs. Selected state is signalled by both a color token
 * and an underline so color is not the only signal.
 */
export function LibraryTabSwitcher({
  value,
  onChange,
  panelIds,
}: LibraryTabSwitcherProps): JSX.Element {
  const reactId = useId();
  const tabRefs = useRef<Record<LibraryTab, HTMLButtonElement | null>>({
    workouts: null,
    exercises: null,
  });

  const focusTab = useCallback((tab: LibraryTab): void => {
    tabRefs.current[tab]?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, tab: LibraryTab): void => {
      const currentIndex = TABS.findIndex((entry) => entry.id === tab);
      if (currentIndex === -1) {
        return;
      }
      let nextIndex: number | null = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % TABS.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = TABS.length - 1;
      }
      if (nextIndex !== null) {
        event.preventDefault();
        const next = TABS[nextIndex];
        if (next) {
          onChange(next.id);
          focusTab(next.id);
        }
      }
    },
    [focusTab, onChange],
  );

  return (
    <div
      role="tablist"
      aria-label="Workout Library tabs"
      className="inline-flex w-full items-stretch rounded-2xl border border-motionly-neutral-200 bg-motionly-bg-light/60 p-1 dark:border-motionly-neutral-800 dark:bg-motionly-neutral-900/40 sm:w-fit"
    >
      {TABS.map((tab) => {
        const selected = tab.id === value;
        const panelId = panelIds[tab.id];
        return (
          <button
            key={tab.id}
            ref={(node) => {
              tabRefs.current[tab.id] = node;
            }}
            id={`${reactId}-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, tab.id)}
            className={cn(
              'min-w-32 flex-1 rounded-xl px-4 py-2 text-label font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-motionly-primary focus-visible:ring-offset-2',
              'focus-visible:ring-offset-motionly-bg-light dark:focus-visible:ring-offset-motionly-bg-dark',
              selected
                ? 'bg-motionly-primary text-white shadow-sm underline decoration-2 underline-offset-4'
                : 'text-motionly-neutral-700 hover:bg-motionly-neutral-100 dark:text-motionly-neutral-200 dark:hover:bg-motionly-neutral-800',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
