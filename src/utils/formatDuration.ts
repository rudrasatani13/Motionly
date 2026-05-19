/**
 * Format a non-negative duration into a clock-style string.
 *
 * - Values are clamped to `>= 0`; negative inputs become `0`.
 * - `NaN` / non-finite inputs return `'0:00'` so callers can safely
 *   use the result inside JSX without conditional checks.
 * - When the total elapsed time is under one hour, the format is
 *   `m:ss` (e.g. `2:14`).
 * - When the total elapsed time is one hour or more, or when the
 *   caller passes `{ forceHours: true }`, the format is `h:mm:ss`
 *   (e.g. `1:02:14`).
 *
 * The helper is presentational — it does not start, run, or tick a
 * timer. Callers (typically `WorkoutTimer`) pass in the latest value
 * they want to display.
 */
type FormatDurationOptions = {
  /**
   * Force the `h:mm:ss` format even when the value is under an hour
   * (useful for long-session timers where the layout must stay stable
   * regardless of elapsed time).
   */
  forceHours?: boolean;
};

/** Number of seconds in one minute / hour. Documented for grep-ability. */
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * 60;

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/**
 * Format a duration expressed in **seconds** to a `m:ss` or `h:mm:ss`
 * string. See module documentation for behavior on invalid input.
 */
export function formatDurationSeconds(
  totalSeconds: number,
  options: FormatDurationOptions = {},
): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return options.forceHours === true ? '0:00:00' : '0:00';
  }
  const safe = Math.floor(totalSeconds);
  const hours = Math.floor(safe / SECONDS_PER_HOUR);
  const minutes = Math.floor((safe % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = safe % SECONDS_PER_MINUTE;

  if (hours > 0 || options.forceHours === true) {
    return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
  }
  return `${minutes}:${pad2(seconds)}`;
}

/**
 * Format a duration expressed in **milliseconds** to a `m:ss` or
 * `h:mm:ss` string. Convenience wrapper around `formatDurationSeconds`
 * — the input is converted with `Math.floor(ms / 1000)`.
 */
export function formatDurationMs(totalMs: number, options: FormatDurationOptions = {}): string {
  if (!Number.isFinite(totalMs) || totalMs < 0) {
    return formatDurationSeconds(0, options);
  }
  return formatDurationSeconds(Math.floor(totalMs / 1000), options);
}
