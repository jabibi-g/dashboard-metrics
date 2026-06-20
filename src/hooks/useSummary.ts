import { useState, useEffect, useRef } from 'react';
import { metricsApi } from '../services/api.service';
import type { DatasetSummary } from '../interfaces/metrics';

export function useSummary(dataset: string, from?: string, to?: string) {
  const [data, setData] = useState<DatasetSummary | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track whether we've received data at least once to distinguish
  // initial load (full spinner) from subsequent re-fetches (subtle indicator)
  const hasData = useRef(false);

  useEffect(() => {
    if (!dataset) return;

    const controller = new AbortController();

    if (!hasData.current) {
      setInitialLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    metricsApi
      .getSummary(dataset, from, to, controller.signal)
      .then((result) => {
        setData(result);
        hasData.current = true;
      })
      .catch((err: unknown) => {
        // Ignore aborts — they're intentional when dataset changes quickly
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Error desconocido');
      })
      .finally(() => {
        setInitialLoading(false);
        setRefreshing(false);
      });

    return () => controller.abort();
  }, [dataset, from, to]);

  return { data, initialLoading, refreshing, error };
}
