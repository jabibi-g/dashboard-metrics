import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import apiRouter from './routes/index';
import { errorHandler } from './handlers/error.handler';
import { notFoundHandler } from './handlers/notfound.handler';

const app = express();

// ─── Security & transport ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, methods: ['GET'], optionsSuccessStatus: 200 }));
app.use(compression() as express.RequestHandler);

// ─── Rate limiting ───────────────────────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: { code: 429, message: 'Too many requests' } },
  }),
);

// ─── Logging & parsing ───────────────────────────────────────────────────────
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json());

// ─── API routes ──────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ─── Fallback handlers ───────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
