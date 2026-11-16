/** "in 5 minutes", "in 3 hours", "tomorrow", "in 4 days" */
export function relativeTime(target: number, now = Date.now()): string {
  const diff = target - now;
  if (diff <= 0) return 'now';
  const min = Math.round(diff / 60_000);
  if (min < 60) return `in ${Math.max(min, 1)} minute${min === 1 ? '' : 's'}`;
  const h = Math.round(diff / 3_600_000);
  if (h < 24) return `in ${h} hour${h === 1 ? '' : 's'}`;
  const d = Math.round(diff / 86_400_000);
  if (d === 1) return 'tomorrow';
  return `in ${d} days`;
}
