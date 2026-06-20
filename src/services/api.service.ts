import { API_BASE } from '../config/api';
import type { DatasetSummary, DayEntry } from '../interfaces/metrics';

async function apiFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? `HTTP ${res.status}`);
  }
  const json = await res.json() as { data: T };
  return json.data;
}

function buildQuery(from?: string, to?: string): string {
  const p = new URLSearchParams();
  if (from) p.set('from', from);
  if (to) p.set('to', to);
  const s = p.toString();
  return s ? `?${s}` : '';
}

export const metricsApi = {
  getDatasets: (): Promise<string[]> =>
    apiFetch<string[]>('/datasets'),

  getSummary: (dataset: string, from?: string, to?: string, signal?: AbortSignal): Promise<DatasetSummary> =>
    apiFetch<DatasetSummary>(`/datasets/${dataset}/summary${buildQuery(from, to)}`, signal),

  getDays: (dataset: string, from?: string, to?: string, signal?: AbortSignal): Promise<DayEntry[]> =>
    apiFetch<DayEntry[]>(`/datasets/${dataset}/days${buildQuery(from, to)}`, signal),
};
