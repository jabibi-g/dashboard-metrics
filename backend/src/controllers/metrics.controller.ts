import { Request, Response, NextFunction } from 'express';
import { metricsService } from '../services/metrics.service';
import { AppError } from '../handlers/error.handler';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function assertDataset(dataset: string): void {
  if (!metricsService.isValidDataset(dataset)) {
    throw new AppError(
      404,
      `Dataset "${dataset}" not found. Available: ${metricsService.getDatasetKeys().join(', ')}`,
    );
  }
}

function assertMetricKey(dataset: string, key: string): void {
  const meta = metricsService.getMetadata(dataset);
  const valid = meta.metrics.map((m) => m.key);
  if (!valid.includes(key)) {
    throw new AppError(404, `Metric "${key}" not found. Available: ${valid.join(', ')}`);
  }
}

function parseDateParam(value: unknown, name: string): string | undefined {
  if (value === undefined) return undefined;
  const str = String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str) || isNaN(Date.parse(str))) {
    throw new AppError(400, `Invalid date for "${name}": expected YYYY-MM-DD, got "${str}"`);
  }
  return str;
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/** GET /api/datasets */
export const listDatasets = (_req: Request, res: Response): void => {
  res.json({ ok: true, data: metricsService.getDatasetKeys() });
};

/** GET /api/datasets/:dataset/metadata */
export const getMetadata = (req: Request, res: Response): void => {
  const dataset = String(req.params['dataset']);
  assertDataset(dataset);
  res.json({ ok: true, data: metricsService.getMetadata(dataset) });
};

/** GET /api/datasets/:dataset/days?from=YYYY-MM-DD&to=YYYY-MM-DD */
export const getDays = (req: Request, res: Response): void => {
  const dataset = String(req.params['dataset']);
  assertDataset(dataset);
  const from = parseDateParam(req.query['from'], 'from');
  const to = parseDateParam(req.query['to'], 'to');
  const days = metricsService.getDays(dataset, from, to);
  res.json({ ok: true, total: days.length, data: days });
};

/** GET /api/datasets/:dataset/summary?from=YYYY-MM-DD&to=YYYY-MM-DD */
export const getSummary = (req: Request, res: Response): void => {
  const dataset = String(req.params['dataset']);
  assertDataset(dataset);
  const from = parseDateParam(req.query['from'], 'from');
  const to = parseDateParam(req.query['to'], 'to');
  res.json({ ok: true, data: metricsService.getSummary(dataset, from, to) });
};

/** GET /api/datasets/:dataset/metrics/:key?from=YYYY-MM-DD&to=YYYY-MM-DD */
export const getMetricSeries = (req: Request, res: Response): void => {
  const dataset = String(req.params['dataset']);
  const key = String(req.params['key']);
  assertDataset(dataset);
  assertMetricKey(dataset, key);
  const from = parseDateParam(req.query['from'], 'from');
  const to = parseDateParam(req.query['to'], 'to');
  const series = metricsService.getMetricSeries(dataset, key, from, to);
  res.json({ ok: true, data: series });
};

// Express 5 catches thrown errors in sync handlers automatically,
// but we wrap async-style ones just for explicitness
export const withErrors =
  (fn: (req: Request, res: Response) => void) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      fn(req, res);
    } catch (err) {
      next(err);
    }
  };
