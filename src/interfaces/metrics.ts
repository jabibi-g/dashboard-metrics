export type Direction = 'higher_is_better' | 'lower_is_better';

export interface MetricMeta {
  key: string;
  label: string;
  unit: string;
  direction: Direction;
  description: string;
}

export interface DatasetMetadata {
  start_date: string;
  end_date: string;
  days: number;
  metrics: MetricMeta[];
}

export interface DayMetricValues {
  [key: string]: number | null;
  traffic: number | null;
  leads_created: number | null;
  leads_qualified: number | null;
  deals_created: number | null;
  deals_won: number | null;
  deals_lost: number | null;
  avg_response_time_min: number | null;
  avg_deal_cycle_days: number | null;
  stale_deals: number | null;
  support_tickets_opened: number | null;
  support_avg_resolution_hours: number | null;
}

export interface DayEntry {
  date: string;
  metrics: DayMetricValues;
}

export interface RawDataset {
  metadata: DatasetMetadata;
  days: DayEntry[];
}

export interface RawMetricsFile {
  [datasetKey: string]: RawDataset;
}

// ─── Computed / response shapes ───────────────────────────────────────────────

export interface MetricStats {
  key: string;
  label: string;
  unit: string;
  direction: Direction;
  total: number | null;
  avg: number | null;
  min: number | null;
  max: number | null;
  last_value: number | null;
  last_7d_avg: number | null;
  last_30d_avg: number | null;
}

export interface FunnelRates {
  traffic_to_leads: number | null;
  leads_to_qualified: number | null;
  qualified_to_deals: number | null;
  deals_win_rate: number | null;
}

export interface DatasetSummary {
  dataset: string;
  period: {
    from: string;
    to: string;
    total_days: number;
  };
  funnel: FunnelRates;
  metrics: MetricStats[];
}

export interface MetricSeries {
  dataset: string;
  key: string;
  label: string;
  unit: string;
  direction: Direction;
  data: Array<{ date: string; value: number | null }>;
}
