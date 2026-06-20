import { useState, useEffect } from 'react';
import { metricsApi } from '../services/api.service';

export function useDatasets() {
  const [datasets, setDatasets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    metricsApi
      .getDatasets()
      .then(setDatasets)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  }, []);

  return { datasets, loading, error };
}
