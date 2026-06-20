import type { FunnelRates } from '../interfaces/metrics';
import { fmtPct } from '../utils/format';

interface FunnelPanelProps {
  funnel: FunnelRates;
  totals: {
    traffic: number | null;
    leads_created: number | null;
    leads_qualified: number | null;
    deals_created: number | null;
    deals_won: number | null;
  };
}

const STAGES = [
  { key: 'traffic',         label: 'Tráfico',            color: '#3b82f6' },
  { key: 'leads_created',   label: 'Leads',              color: '#8b5cf6' },
  { key: 'leads_qualified', label: 'Calificados',        color: '#ec4899' },
  { key: 'deals_created',   label: 'Deals abiertos',     color: '#f59e0b' },
  { key: 'deals_won',       label: 'Deals ganados',      color: '#10b981' },
] as const;

const RATE_LABELS: Record<string, string> = {
  traffic_to_leads:      'Tráfico → Leads',
  leads_to_qualified:    'Leads → Calificados',
  qualified_to_deals:    'Calificados → Deals',
  deals_win_rate:        'Win rate',
};

const RATE_KEYS = ['traffic_to_leads', 'leads_to_qualified', 'qualified_to_deals', 'deals_win_rate'] as const;

export function FunnelPanel({ funnel, totals }: FunnelPanelProps) {
  const maxVal = totals.traffic ?? 1;

  return (
    <div className="funnel-panel">
      <span className="funnel-title">Embudo de conversión</span>

      <div className="funnel-stages">
        {STAGES.map((stage, i) => {
          const value = totals[stage.key] ?? 0;
          const pct = (value / maxVal) * 100;
          const rateKey = RATE_KEYS[i] as keyof FunnelRates | undefined;

          return (
            <div key={stage.key}>
              <div className="funnel-stage">
                <div className="funnel-stage-header">
                  <span className="funnel-stage-name">{stage.label}</span>
                  <span className="funnel-stage-value">{value.toLocaleString('es-CL')}</span>
                </div>
                <div className="funnel-bar-track">
                  <div
                    className="funnel-bar-fill"
                    style={{ width: `${pct}%`, background: stage.color }}
                  />
                </div>
              </div>

              {rateKey !== undefined && (
                <div className="funnel-arrow">
                  <div className="funnel-arrow-line" />
                  <span className="funnel-arrow-rate">
                    {RATE_LABELS[rateKey]}: {fmtPct(funnel[rateKey])}
                  </span>
                  <div className="funnel-arrow-line" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
