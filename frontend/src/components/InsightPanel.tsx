import { useMemo } from 'react';
import type { MetricStats } from '../interfaces/metrics';
import { generateInsights, countBySeverity, type Insight, type Severity } from '../utils/insights';

interface InsightPanelProps {
  metrics: MetricStats[];
  periodLabel: string;
}

const SEVERITY_CONFIG: Record<Severity, { label: string; className: string }> = {
  critical: { label: 'Requiere atención', className: 'critical' },
  warning:  { label: 'En observación',    className: 'warning'  },
  stable:   { label: 'Estable',           className: 'stable'   },
  positive: { label: 'Favorable',         className: 'positive' },
};

export function InsightPanel({ metrics, periodLabel }: InsightPanelProps) {
  const insights = useMemo(() => generateInsights(metrics), [metrics]);
  const counts   = useMemo(() => countBySeverity(insights), [insights]);

  // Show all critical + warning, up to 2 positive, 1 stable — max 7 rows
  const displayed = useMemo(() => {
    const critical  = insights.filter((i) => i.severity === 'critical');
    const warnings  = insights.filter((i) => i.severity === 'warning');
    const positives = insights.filter((i) => i.severity === 'positive').slice(0, 2);
    const stables   = insights.filter((i) => i.severity === 'stable').slice(0, 1);
    return [...critical, ...warnings, ...positives, ...stables].slice(0, 7);
  }, [insights]);

  const summaryParts: string[] = [];
  if (counts.critical > 0) summaryParts.push(`${counts.critical} requiere${counts.critical > 1 ? 'n' : ''} atención`);
  if (counts.warning  > 0) summaryParts.push(`${counts.warning} en observación`);
  if (counts.positive > 0) summaryParts.push(`${counts.positive} favorable${counts.positive > 1 ? 's' : ''}`);
  if (summaryParts.length === 0) summaryParts.push('Todo en niveles normales');

  return (
    <div className="insight-panel">
      {/* Header */}
      <div className="insight-panel-header">
        <div>
          <span className="insight-panel-title">Resumen semanal</span>
          <span className="insight-panel-period">{periodLabel}</span>
        </div>
        <span className="insight-panel-summary">{summaryParts.join(' · ')}</span>
      </div>

      {/* Rows */}
      <div className="insight-list">
        {displayed.map((insight) => (
          <InsightRow key={insight.key} insight={insight} />
        ))}
      </div>
    </div>
  );
}

function InsightRow({ insight }: { insight: Insight }) {
  const cfg = SEVERITY_CONFIG[insight.severity];

  return (
    <div className={`insight-row insight-row--${cfg.className}`}>
      <div className={`insight-severity-bar insight-severity-bar--${cfg.className}`} />

      <div className="insight-row-body">
        {/* Top line: label + value + badge */}
        <div className="insight-row-top">
          <span className="insight-metric-name">{insight.label}</span>
          <span className="insight-metric-value">{insight.valueLine}</span>
          <span className="insight-context-pct">{insight.contextLine}</span>
          <span className={`insight-badge insight-badge--${cfg.className}`}>{cfg.label}</span>
        </div>

        {/* Bottom line: business note */}
        {insight.businessNote && (
          <p className="insight-business-note">{insight.businessNote}</p>
        )}
      </div>
    </div>
  );
}
