import type { WorkoutFilterChip } from '@/types/workout-library';
import { Chip } from '@components/primitives';

type WorkoutFilterChipsProps = {
  /** Currently-selected chip. */
  value: WorkoutFilterChip;
  /** Handler invoked when the user picks a chip. */
  onChange: (next: WorkoutFilterChip) => void;
};

type ChipConfig = {
  id: WorkoutFilterChip;
  label: string;
};

/**
 * Order on screen follows the wireframe: All, Beginner, Intermediate,
 * Quick <=15min, Strength, Mobility.
 */
const CHIPS: ReadonlyArray<ChipConfig> = [
  { id: 'all', label: 'All' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'quick', label: 'Quick ≤15min' },
  { id: 'strength', label: 'Strength' },
  { id: 'mobility', label: 'Mobility' },
];

/**
 * Phase 14 — Single-select filter chip row for the Workouts tab.
 *
 * Uses the Phase 8 `Chip` primitive so selected state is announced
 * via `aria-pressed` and the visual treatment respects Motionly's
 * color tokens. The row scrolls horizontally on narrow viewports.
 */
export function WorkoutFilterChips({ value, onChange }: WorkoutFilterChipsProps): JSX.Element {
  return (
    <div
      role="group"
      aria-label="Filter workouts"
      className="-mx-1 flex w-full gap-2 overflow-x-auto px-1 pb-1"
    >
      {CHIPS.map((chip) => (
        <Chip
          key={chip.id}
          selected={value === chip.id}
          onClick={() => onChange(chip.id)}
          className="shrink-0"
        >
          {chip.label}
        </Chip>
      ))}
    </div>
  );
}
