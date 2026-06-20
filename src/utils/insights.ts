import type { MetricStats } from '../interfaces/metrics';
import { computeTrend, fmt } from './format';

export type Severity = 'critical' | 'warning' | 'stable' | 'positive';

export interface Insight {
  key: string;
  label: string;
  unit: string;
  severity: Severity;
  valueLine: string;
  contextLine: string;
  businessNote: string;
}

// ─── Thresholds ───────────────────────────────────────────────────────────────
// A metric is "critical" if it's 15%+ off in the wrong direction,
// "warning" if 7–15% off, "positive" if 7%+ better than baseline.
const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  warning: 1,
  stable: 2,
  positive: 3,
};

function classifySeverity(pct: number, isGoodTrend: boolean): Severity {
  const abs = Math.abs(pct);
  if (isGoodTrend) return abs >= 7 ? 'positive' : 'stable';
  if (abs >= 15) return 'critical';
  if (abs >= 7) return 'warning';
  return 'stable';
}

// ─── Business context per metric ─────────────────────────────────────────────
const NOTES: Record<string, { bad: string; good: string }> = {
  traffic: {
    bad:  'Menor entrada al embudo — menos potenciales leads esta semana.',
    good: 'Mayor tráfico al sitio — más potenciales leads en el embudo.',
  },
  leads_created: {
    bad:  'Menos oportunidades entrando al pipeline esta semana.',
    good: 'Mayor generación de nuevos leads que la media del período.',
  },
  leads_qualified: {
    bad:  'Calificación de leads por debajo de la media — revisar criterios o calidad de leads.',
    good: 'Mejor tasa de calificación de leads que la media del período.',
  },
  deals_created: {
    bad:  'Menor conversión de leads calificados a oportunidades de venta.',
    good: 'Más deals nuevos abiertos — buen flujo en el pipeline.',
  },
  deals_won: {
    bad:  'Menos cierres esta semana — revisar etapas finales del proceso de venta.',
    good: 'Semana sólida en cierres de venta.',
  },
  deals_lost: {
    bad:  'Más deals perdidos que la media — analizar objeciones o competencia.',
    good: 'Menos pérdidas de deals esta semana.',
  },
  avg_response_time_min: {
    bad:  'El equipo tarda más en responder nuevos leads — en B2B esto reduce la conversión.',
    good: 'Respuestas más rápidas a nuevos leads que la media del período.',
  },
  avg_deal_cycle_days: {
    bad:  'Los deals tardan más en cerrarse — puede indicar deals trabados o procesos lentos.',
    good: 'Ciclos de venta más cortos que la media — mayor velocidad de cierre.',
  },
  stale_deals: {
    bad:  'Más deals sin avance en el pipeline — requiere revisión con el equipo.',
    good: 'Reducción de deals estancados — mejora en la salud del pipeline.',
  },
  support_tickets_opened: {
    bad:  'Aumento de tickets de soporte — posible problema de producto o servicio.',
    good: 'Menos tickets de soporte abiertos que la media del período.',
  },
  support_avg_resolution_hours: {
    bad:  'El soporte está tardando más en resolver tickets que la media del período.',
    good: 'Resolución de tickets más rápida que la media del período.',
  },
};

// ─── Main export ──────────────────────────────────────────────────────────────
export function generateInsights(metrics: MetricStats[]): Insight[] {
  const insights: Insight[] = metrics.map((m) => {
    const trend = computeTrend(m.last_7d_avg, m.last_30d_avg, m.direction);
    const decimals = ['min', 'days', 'hours'].includes(m.unit) ? 1 : 0;
    const displayVal = m.last_7d_avg ?? m.last_value;
    const valueLine = displayVal !== null ? `${fmt(displayVal, decimals)} ${m.unit}` : '—';

    if (!trend) {
      return {
        key: m.key, label: m.label, unit: m.unit,
        severity: 'stable' as Severity,
        valueLine,
        contextLine: 'Sin suficientes datos comparativos',
        businessNote: '',
      };
    }

    const severity = classifySeverity(trend.pct, trend.isPositive);
    const sign = trend.pct > 0 ? '+' : '';
    const contextLine = `${sign}${trend.pct.toFixed(1)}% vs. media de 30 días`;
    const notes = NOTES[m.key];
    const businessNote = notes
      ? (trend.isPositive ? notes.good : notes.bad)
      : '';

    return { key: m.key, label: m.label, unit: m.unit, severity, valueLine, contextLine, businessNote };
  });

  return insights.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}

export function countBySeverity(insights: Insight[]) {
  return {
    critical: insights.filter((i) => i.severity === 'critical').length,
    warning:  insights.filter((i) => i.severity === 'warning').length,
    positive: insights.filter((i) => i.severity === 'positive').length,
    stable:   insights.filter((i) => i.severity === 'stable').length,
  };
}
