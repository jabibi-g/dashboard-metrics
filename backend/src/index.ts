import { config } from './config/env';
import { metricsService } from './services/metrics.service';
import app from './app';

// Load data before accepting any requests
try {
  metricsService.load();
} catch (err) {
  console.error('[Fatal] Could not load metrics.json:', err);
  process.exit(1);
}

const server = app.listen(config.port, () => {
  console.log(`[Server] Running in ${config.nodeEnv} mode on http://localhost:${config.port}`);
  console.log(`[Server] API available at http://localhost:${config.port}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
