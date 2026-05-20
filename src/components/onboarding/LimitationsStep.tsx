import { useId } from 'react';

import { LIMITATION_NOTES_MAX_LENGTH, type MovementLimitation } from '@/types/onboarding';
import { Column, Heading, Text } from '@components/primitives';
import { cn } from '@utils/cn';

type LimitationOption = {
  id: MovementLimitation;
  label: string;
};

const LIMITATION_OPTIONS: LimitationOption[] = [
  { id: 'lower_back', label: 'Lower back' },
  { id: 'knees', label: 'Knees' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'hips', label: 'Hips' },
  { id: 'ankles', label: 'Ankles' },
  { id: 'wrists', label: 'Wrists' },
  { id: 'none', label: 'None' },
];

type LimitationsStepProps = {
  headingId: string;
  selectedLimitations: MovementLimitation[];
  limitationNotes: string;
  onToggleLimitation: (limitation: MovementLimitation) => void;
  onChangeLimitationNotes: (notes: string) => void;
};

export function LimitationsStep({
  headingId,
  selectedLimitations,
  limitationNotes,
  onToggleLimitation,
  onChangeLimitationNotes,
}: LimitationsStepProps): JSX.Element {
  const notesId = useId();
  const notesHelperId = `${notesId}-helper`;
  const notesCountId = `${notesId}-count`;
  const remaining = LIMITATION_NOTES_MAX_LENGTH - limitationNotes.length;

  return (
    <Column gap="lg" className="flex-1">
      <Column gap="sm">
        <Heading id={headingId} level={1}>
          Anything we should work around?
        </Heading>
        <Text tone="muted">
          Choose any areas you want Motionly to go easier on. Tap None if nothing specific comes to
          mind.
        </Text>
      </Column>

      <Column gap="sm">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-labelledby={headingId}
          aria-describedby={notesHelperId}
        >
          {LIMITATION_OPTIONS.map((option) => {
            const isSelected = selectedLimitations.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isSelected}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-label font-medium',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-motionly-primary focus-visible:ring-offset-2',
                  'focus-visible:ring-offset-motionly-bg-light dark:focus-visible:ring-offset-motionly-bg-dark',
                  isSelected
                    ? 'border-motionly-primary bg-motionly-primary/10 text-motionly-primary'
                    : 'border-motionly-neutral-200 bg-transparent text-motionly-neutral-700 hover:bg-motionly-neutral-100 active:bg-motionly-neutral-200 dark:border-motionly-neutral-800 dark:text-motionly-neutral-200 dark:hover:bg-motionly-neutral-900 dark:active:bg-motionly-neutral-800',
                )}
                onClick={() => onToggleLimitation(option.id)}
              >
                {option.label}
                {isSelected ? <span className="sr-only"> selected</span> : null}
              </button>
            );
          })}
        </div>
      </Column>

      <Column gap="sm">
        <label
          htmlFor={notesId}
          className="text-label text-motionly-neutral-800 dark:text-motionly-neutral-200"
        >
          Anything else?{' '}
          <span className="text-caption font-normal text-motionly-neutral-500 dark:text-motionly-neutral-400">
            Optional
          </span>
        </label>
        <textarea
          id={notesId}
          value={limitationNotes}
          onChange={(event) => onChangeLimitationNotes(event.target.value)}
          maxLength={LIMITATION_NOTES_MAX_LENGTH}
          rows={3}
          aria-describedby={`${notesHelperId} ${notesCountId}`}
          placeholder="A short note helps Motionly understand what to ease up on."
          className={cn(
            'block w-full rounded-xl border bg-motionly-bg-light px-3 py-2 text-body text-motionly-neutral-900',
            'transition-colors duration-150 placeholder:text-motionly-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-motionly-primary focus:ring-offset-2',
            'focus:ring-offset-motionly-bg-light dark:focus:ring-offset-motionly-bg-dark',
            'border-motionly-neutral-300 hover:border-motionly-neutral-400',
            'dark:border-motionly-neutral-700 dark:hover:border-motionly-neutral-600',
            'dark:bg-motionly-bg-dark dark:text-motionly-neutral-50 dark:placeholder:text-motionly-neutral-500',
          )}
        />
        <div className="flex items-center justify-between">
          <p
            id={notesHelperId}
            className="text-caption text-motionly-neutral-500 dark:text-motionly-neutral-400"
          >
            If something hurts during a workout, stop. Motionly is a coach, not medical care.
          </p>
          <p
            id={notesCountId}
            aria-live="polite"
            className="text-caption text-motionly-neutral-500 dark:text-motionly-neutral-400"
          >
            {limitationNotes.length}/{LIMITATION_NOTES_MAX_LENGTH}
            <span className="sr-only"> characters used. {remaining} remaining.</span>
          </p>
        </div>
      </Column>
    </Column>
  );
}
