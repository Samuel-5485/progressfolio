const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Buckets a YYYY-MM-DD date into a Monday-anchored week index (no ISO
 * week-number string parsing needed - just used for consecutive-week math). */
function mondayWeekIndex(dateStr: string): number {
  const date = new Date(`${dateStr}T00:00:00Z`);
  const dayNr = (date.getUTCDay() + 6) % 7; // Monday = 0 ... Sunday = 6
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - dayNr);
  return Math.floor(monday.getTime() / WEEK_MS);
}

/**
 * Counts consecutive weeks (ending at the most recent week that has an
 * entry) with at least one published timeline entry. Used for the
 * "building in public" streak shown on the dashboard and public page.
 */
export function computeStreakWeeks(entryDates: string[]): number {
  if (entryDates.length === 0) return 0;

  const weekIndices = Array.from(new Set(entryDates.map(mondayWeekIndex))).sort((a, b) => b - a);

  let streak = 1;
  for (let i = 1; i < weekIndices.length; i++) {
    if (weekIndices[i] === weekIndices[i - 1] - 1) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}
