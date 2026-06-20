import type { MetricStats } from '../interfaces/metrics';
import { fmt, computeTrend } from '../utils/format';

interface KPICardProps {
  stat: MetricStats;
}

export function KPICard({ stat }: KPICardProps) {
  const trend = computeTrend(stat.last_7d_avg, stat.last_30d_avg, stat.direction);
  const isAlert = trend !== null && !trend.isPositive;

  // Primary display: last 7-day average (more stable than a single day)
  const displayValue = stat.last_7d_avg ?? stat.last_value;

  const decimals =
    stat.unit === 'min' || stat.unit === 'days' || stat.unit === 'hours' ? 1 : 0;

  return (
    <div className={`kpi-card ${isAlert ? 'alert' : ''}`} title={stat.label}>
      <span className="kpi-label">{stat.label}</span>

      <div>
        <span className="kpi-value">{fmt(displayValue, decimals)}</span>
        <span className="kpi-unit">{stat.unit}</span>
      </div>

      <div className="kpi-footer">
        {trend !== null ? (
          <span className={`kpi-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.pct).toFixed(1)}%
          </span>
        ) : (
          <span className="kpi-trend neutral">—</span>
        )}
        <span className="kpi-baseline">vs media 30d</span>
      </div>
    </div>
  );
}
