/**
 * Local calendar-day helpers. "One check-in per day" (FR-004) is evaluated on the patient's
 * local date, not UTC — matches user expectation near midnight. Pure + injectable for tests.
 */

/** Local date as YYYY-MM-DD. Accepts an optional Date for deterministic tests. */
export function todayLocal(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
