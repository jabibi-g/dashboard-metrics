import { Router, Request, Response } from 'express';
import metricsRouter from './metrics.routes';

const router = Router();

// Health check — fast response, no data layer
router.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Mount domain routers
router.use('/datasets', metricsRouter);

export default router;
