import { Search } from 'lucide-react';
import { useId, type ChangeEvent } from 'react';

import type {
  ExerciseDifficulty,
  ExerciseLibraryFilters,
  MuscleGroup,
} from '@/types/workout-library';
import { Chip, Column, Icon, Row, Text } from '@components/primitives';

import { exerciseDifficultyLabel, muscleGroupLabel } from './labels';

type ExerciseFilterBarProps = {
  /** Current filter state. */
  filters: ExerciseLibraryFilters;
  /** Replace the filter state. */
  onChange: (next: ExerciseLibraryFilters) => void;
  /**
   * Muscle groups offered as chips. Limited to those that appear in
   * the catalog so we never advertise an empty filter.
   */
  availableMuscles: ReadonlyArray<MuscleGroup>;
};

const DIFFICULTY_OPTIONS: ReadonlyArray<ExerciseDifficulty> = [
  'beginner',
  'intermediate',
  'advanced',
];

/**
 * Phase 14 — Filter row for the Exercises tab.
 *
 * Combines a debounced text search input with two single-select chip
 * rows for muscle group and difficulty. The chips use `aria-pressed`
 * via the Phase 8 `Chip` primitive, and the search input renders a
 * visually-hidden label for assistive tech.
 */
export function ExerciseFilterBar({
  filters,
  onChange,
  availableMuscles,
}: ExerciseFilterBarProps): JSX.Element {
  const reactId = useId();
  const searchId = `${reactId}-exercise-search`;

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange({ ...filters, query: event.target.value });
  };

  const handleMuscleSelect = (muscle: MuscleGroup | null): void => {
    onChange({ ...filters, muscle });
  };

  const handleDifficultySelect = (difficulty: ExerciseDifficulty | null): void => {
    onChange({ ...filters, difficulty });
  };

  return (
    <Column gap="md">
      <div>
        <label htmlFor={searchId} className="sr-only">
          Search exercises
        </label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-motionly-neutral-500 dark:text-motionly-neutral-400"
          >
            <Icon icon={Search} size="sm" />
          </span>
          <input
            id={searchId}
            type="search"
            value={filters.query}
            onChange={handleQueryChange}
            placeholder="Search exercises by name, muscle, or focus"
            className="block w-full rounded-xl border border-motionly-neutral-300 bg-motionly-bg-light py-2 pl-9 pr-3 text-body text-motionly-neutral-900 placeholder:text-motionly-neutral-400 focus:outline-none focus:ring-2 focus:ring-motionly-primary focus:ring-offset-2 focus:ring-offset-motionly-bg-light dark:border-motionly-neutral-700 dark:bg-motionly-bg-dark dark:text-motionly-neutral-50 dark:placeholder:text-motionly-neutral-500 dark:focus:ring-offset-motionly-bg-dark"
          />
        </div>
      </div>

      <Column gap="xs">
        <Text variant="caption" tone="muted" as="span">
          Muscle group
        </Text>
        <Row
          align="center"
          gap="xs"
          className="-mx-1 w-full overflow-x-auto px-1 pb-1"
          wrap={false}
        >
          <Chip
            selected={filters.muscle === null}
            onClick={() => handleMuscleSelect(null)}
            className="shrink-0"
          >
            All
          </Chip>
          {availableMuscles.map((muscle) => (
            <Chip
              key={muscle}
              selected={filters.muscle === muscle}
              onClick={() => handleMuscleSelect(muscle)}
              className="shrink-0"
            >
              {muscleGroupLabel(muscle)}
            </Chip>
          ))}
        </Row>
      </Column>

      <Column gap="xs">
        <Text variant="caption" tone="muted" as="span">
          Difficulty
        </Text>
        <Row align="center" gap="xs" wrap>
          <Chip selected={filters.difficulty === null} onClick={() => handleDifficultySelect(null)}>
            All
          </Chip>
          {DIFFICULTY_OPTIONS.map((difficulty) => (
            <Chip
              key={difficulty}
              selected={filters.difficulty === difficulty}
              onClick={() => handleDifficultySelect(difficulty)}
            >
              {exerciseDifficultyLabel(difficulty)}
            </Chip>
          ))}
        </Row>
      </Column>
    </Column>
  );
}
