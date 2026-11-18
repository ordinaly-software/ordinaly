/**
 * Formats a duration expressed in (possibly fractional) hours as "1h 20min".
 * Avoids exposing raw floats such as 1.3333333333333333.
 */
export function formatDurationHours(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}
