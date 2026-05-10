import { useState, useEffect } from 'react';
import { metricsApi } from '../services/metrics.service';
import type { DayEntry } from '../interfaces/metrics';

export function useDays(dataset: string, from?: string, to?: string) {
  const [data, setData] = useState<DayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dataset) return;
    setLoading(true);
    setError(null);
    metricsApi
      .getDays(dataset, from, to)
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  }, [dataset, from, to]);

  return { data, loading, error };
}
