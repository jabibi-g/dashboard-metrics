import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend/ root (two levels up from src/config/)
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const BACKEND_ROOT = path.resolve(__dirname, '..', '..');
const PROJECT_ROOT = path.resolve(BACKEND_ROOT, '..');

export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  // metrics.json lives at the project root, one level above backend/
  metricsDataPath:
    process.env.METRICS_DATA_PATH ?? path.join(PROJECT_ROOT, 'metrics.json'),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
} as const;
