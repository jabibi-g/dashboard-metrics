import type { Direction } from '../interfaces/metrics';

/** Format a number with locale separators. Null → '—' */
export function fmt(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format a ratio (0–1) as a percentage string */
export function fmtPct(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return '—';
  return `${(value * 100).toFixed(decimals)}%`;
}

/** Format an ISO date string to short display (e.g. "26 abr") */
export function fmtDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
}

/**
 * Compute the trend between two averages.
 * Returns: { pct, isPositive }
 * isPositive = the trend is good for the business (accounts for direction)
 */
export function computeTrend(
  recent: number | null,
  baseline: number | null,
  direction: Direction,
): { pct: number; isPositive: boolean } | null {
  if (recent === null || baseline === null || baseline === 0) return null;
  const pct = ((recent - baseline) / Math.abs(baseline)) * 100;
  const isPositive = direction === 'higher_is_better' ? pct >= 0 : pct <= 0;
  return { pct, isPositive };
}
