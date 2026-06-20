import fs from 'fs';
import { config } from '../config/env';
import {
  RawMetricsFile,
  RawDataset,
  DayEntry,
  MetricMeta,
  DatasetSummary,
  MetricStats,
  FunnelRates,
  MetricSeries,
} from '../interfaces/metrics';

class MetricsService {
  private data: RawMetricsFile | null = null;

  /** Reads and caches metrics.json once at startup. */
  load(): void {
    const raw = fs.readFileSync(config.metricsDataPath, 'utf-8');
    this.data = JSON.parse(raw) as RawMetricsFile;
    console.log(`[MetricsService] Loaded datasets: ${this.getDatasetKeys().join(', ')}`);
  }

  private get(): RawMetricsFile {
    if (!this.data) throw new Error('Metrics data not loaded. Call load() first.');
    return this.data;
  }

  getDatasetKeys(): string[] {
    return Object.keys(this.get());
  }

  isValidDataset(key: string): boolean {
    return key in this.get();
  }

  getMetadata(dataset: string): RawDataset['metadata'] {
    return this.get()[dataset].metadata;
  }

  getDays(dataset: string, from?: string, to?: string): DayEntry[] {
    let days = this.get()[dataset].days;
    if (from) days = days.filter((d) => d.date >= from);
    if (to) days = days.filter((d) => d.date <= to);
    return days;
  }

  getMetricSeries(dataset: string, metricKey: string, from?: string, to?: string): MetricSeries | null {
    const meta = this.getMetadata(dataset);
    const metricMeta = meta.metrics.find((m) => m.key === metricKey);
    if (!metricMeta) return null;

    const days = this.getDays(dataset, from, to);
    return {
      dataset,
      key: metricKey,
      label: metricMeta.label,
      unit: metricMeta.unit,
      direction: metricMeta.direction,
      data: days.map((d) => ({
        date: d.date,
        value: (d.metrics as Record<string, number | null>)[metricKey] ?? null,
      })),
    };
  }

  getSummary(dataset: string, from?: string, to?: string): DatasetSummary {
    const raw = this.get()[dataset];
    const days = this.getDays(dataset, from, to);

    const metrics: MetricStats[] = raw.metadata.metrics.map((meta) =>
      computeMetricStats(meta, days),
    );

    return {
      dataset,
      period: {
        from: days[0]?.date ?? raw.metadata.start_date,
        to: days[days.length - 1]?.date ?? raw.metadata.end_date,
        total_days: days.length,
      },
      funnel: computeFunnelRates(days),
      metrics,
    };
  }
}

// ─── Pure computation helpers ─────────────────────────────────────────────────

function pluck(days: DayEntry[], key: string): number[] {
  return days
    .map((d) => (d.metrics as Record<string, number | null>)[key])
    .filter((v): v is number => v !== null && v !== undefined);
}

function safeSum(values: number[]): number | null {
  return values.length === 0 ? null : values.reduce((a, b) => a + b, 0);
}

function safeAvg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function r2(n: number | null): number | null {
  return n === null ? null : Math.round(n * 100) / 100;
}

function computeMetricStats(meta: MetricMeta, days: DayEntry[]): MetricStats {
  const all = pluck(days, meta.key);
  const last7 = pluck(days.slice(-7), meta.key);
  const last30 = pluck(days.slice(-30), meta.key);
  const lastDay = days[days.length - 1];
  const lastValue = lastDay
    ? ((lastDay.metrics as Record<string, number | null>)[meta.key] ?? null)
    : null;

  return {
    key: meta.key,
    label: meta.label,
    unit: meta.unit,
    direction: meta.direction,
    total: r2(safeSum(all)),
    avg: r2(safeAvg(all)),
    min: all.length ? Math.min(...all) : null,
    max: all.length ? Math.max(...all) : null,
    last_value: lastValue,
    last_7d_avg: r2(safeAvg(last7)),
    last_30d_avg: r2(safeAvg(last30)),
  };
}

function computeFunnelRates(days: DayEntry[]): FunnelRates {
  const traffic = safeSum(pluck(days, 'traffic'));
  const leadsCreated = safeSum(pluck(days, 'leads_created'));
  const leadsQualified = safeSum(pluck(days, 'leads_qualified'));
  const dealsCreated = safeSum(pluck(days, 'deals_created'));
  const dealsWon = safeSum(pluck(days, 'deals_won'));
  const dealsLost = safeSum(pluck(days, 'deals_lost'));
  const winDenom = (dealsWon ?? 0) + (dealsLost ?? 0);

  return {
    traffic_to_leads: traffic && leadsCreated ? r2(leadsCreated / traffic) : null,
    leads_to_qualified: leadsCreated && leadsQualified ? r2(leadsQualified / leadsCreated) : null,
    qualified_to_deals: leadsQualified && dealsCreated ? r2(dealsCreated / leadsQualified) : null,
    deals_win_rate: winDenom > 0 ? r2((dealsWon ?? 0) / winDenom) : null,
  };
}

// Singleton exported for use across the app
export const metricsService = new MetricsService();
