/**
 * @fileOverview Centralized utilities for handling local calendar dates.
 * Ensures consistency between UI, logic, and database keys.
 */

/**
 * Returns a stable YYYY-MM-DD string for the given date in the user's local timezone.
 */
export function getLocalDayKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a Date object representing the very beginning (00:00:00.000) of the local calendar day.
 */
export function getStartOfLocalDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the ISO string of the local start of the day for consistent Firestore queries.
 */
export function getStartOfLocalDayISO(date: Date = new Date()): string {
  return getStartOfLocalDay(date).toISOString();
}
