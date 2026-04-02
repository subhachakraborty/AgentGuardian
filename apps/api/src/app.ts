// src/app.ts — Express app configuration
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { generalLimiter } from './middleware/rateLimit';

// Route imports
import authRoutes from './routes/auth';
import healthRouter from './routes/health';
import connectionRoutes from './routes/connections';
import permissionRoutes from './routes/permissions';
import agentRoutes from './routes/agent';
import auditRoutes from './routes/audit';

const app = express();

// ─── Global Middleware ──────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);
app.use(generalLimiter);

// Trust proxy (for Railway/Vercel)
app.set('trust proxy', 1);

// ─── Routes ─────────────────────────────────────────────
// Health check (no auth prefix)
app.use('/api/v1', healthRouter);

// Authenticated routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/connections', connectionRoutes);
app.use('/api/v1/permissions', permissionRoutes);
app.use('/api/v1/agent', agentRoutes);
app.use('/api/v1/audit', auditRoutes);

// ─── Error Handler ──────────────────────────────────────
app.use(errorHandler);

export default app;
