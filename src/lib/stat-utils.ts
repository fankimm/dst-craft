/** Tailwind color class for positive/negative/zero stat values */
export function statColor(value: number): string {
  if (value > 0) return "text-green-600 dark:text-green-400";
  if (value < 0) return "text-red-500 dark:text-red-400";
  return "text-muted-foreground";
}

/** Format stat with +/- sign */
export function formatStat(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}
