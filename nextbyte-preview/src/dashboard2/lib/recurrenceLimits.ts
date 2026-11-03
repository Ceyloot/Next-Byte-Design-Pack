/**
 * Safety limits for recurring calendar events.
 *
 * A user once created a recurring event with an end date in the year
 * 675483092 which caused the in-memory expansion loop in
 * `useRecurringEvents` to generate billions of instances and freeze the
 * whole app on every calendar render — effectively locking the account
 * out of the platform. These limits prevent that from ever happening
 * again, both at input time and defensively when reading bad legacy
 * data from the database.
 */

export const MAX_RECURRENCE_YEARS = 5;
export const MAX_RECURRENCE_INSTANCES = 2000;

/** Returns the latest allowed recurrence end date relative to `start`. */
export function getMaxRecurrenceEndDate(start: Date = new Date()): Date {
  const d = new Date(start);
  d.setFullYear(d.getFullYear() + MAX_RECURRENCE_YEARS);
  return d;
}

/**
 * Clamp a recurrence end date so it never exceeds MAX_RECURRENCE_YEARS
 * from the event start. Returns the clamped Date, or the max end date
 * if `end` is null/undefined/invalid.
 */
export function clampRecurrenceEnd(start: Date, end: Date | string | null | undefined): Date {
  const max = getMaxRecurrenceEndDate(start);
  if (!end) return max;
  const d = end instanceof Date ? end : new Date(end);
  if (isNaN(d.getTime())) return max;
  return d > max ? max : d;
}
