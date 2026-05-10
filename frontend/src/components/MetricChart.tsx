import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { DayEntry, Direction } from '../interfaces/metrics';
import { fmtDate } from '../utils/format';

// Structural type — only requires the fields this component actually uses.
// Compatible with both MetricMeta[] and MetricStats[] from the summary endpoint.
type ChartMetricEntry = {
  key: string;
  label: string;
  unit: string;
  direction: Direction;
  description?: string;
};

interface MetricChartProps {
  days: DayEntry[];
  metricsMeta: ChartMetricEntry[];
  activeKey: string;
  onKeyChange: (key: string) => void;
}

// Subsample long series to keep the chart readable (max 90 points)
function subsample(days: DayEntry[], maxPoints: number): DayEntry[] {
  if (days.length <= maxPoints) return days;
  const step = Math.ceil(days.length / maxPoints);
  return days.filter((_, i) => i % step === 0);
}

export function MetricChart({ days, metricsMeta, activeKey, onKeyChange }: MetricChartProps) {
  const meta = metricsMeta.find((m) => m.key === activeKey);
  const sampled = subsample(days, 90);

  const chartData = sampled.map((d) => ({
    date: d.date,
    value: d.metrics[activeKey],
  }));

  // Average line for reference
  const validValues = chartData.map((d) => d.value).filter((v): v is number => v !== null);
  const avg = validValues.length > 0
    ? validValues.reduce((a, b) => a + b, 0) / validValues.length
    : null;

  const color = meta?.direction === 'higher_is_better' ? '#3b82f6' : '#f59e0b';

  return (
    <div className="metric-chart-card">
      {/* Metric selector tabs */}
      <div className="chart-controls">
        {metricsMeta.map((m) => (
          <button
            key={m.key}
            className={`metric-tab ${m.key === activeKey ? 'active' : ''}`}
            onClick={() => onKeyChange(m.key)}
            title={m.description}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={50}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
            />
            <Tooltip
              formatter={(value: number | null) => [
                value !== null ? `${value} ${meta?.unit ?? ''}` : '—',
                meta?.label ?? activeKey,
              ]}
              labelFormatter={(label: string) => fmtDate(label)}
              contentStyle={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-strong)',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}
            />
            {avg !== null && (
              <ReferenceLine
                y={avg}
                stroke="var(--text-muted)"
                strokeDasharray="4 4"
                label={{ value: 'avg', position: 'insideTopRight', fill: 'var(--text-muted)', fontSize: 10 }}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
