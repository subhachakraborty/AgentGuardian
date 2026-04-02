import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/v1/health — Health check (no auth)
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'agent-guardian-api' });
});

export default router;
