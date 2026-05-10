import { Router } from 'express';
import {
  listDatasets,
  getMetadata,
  getDays,
  getSummary,
  getMetricSeries,
  withErrors,
} from '../controllers/metrics.controller';

const router = Router();

// List all available datasets
router.get('/', withErrors(listDatasets));

// Per-dataset routes
router.get('/:dataset/metadata', withErrors(getMetadata));
router.get('/:dataset/days', withErrors(getDays));
router.get('/:dataset/summary', withErrors(getSummary));
router.get('/:dataset/metrics/:key', withErrors(getMetricSeries));

export default router;
