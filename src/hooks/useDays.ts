import { useState, useEffect, useRef } from 'react';
import { metricsApi } from '../services/api.service';
import type { DayEntry } from '../interfaces/metrics';

export function useDays(dataset: string, from?: string, to?: string) {
  const [data, setData] = useState<DayEntry[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      .getDays(dataset, from, to, controller.signal)
      .then((result) => {
        setData(result);
        hasData.current = true;
      })
      .catch((err: unknown) => {
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
