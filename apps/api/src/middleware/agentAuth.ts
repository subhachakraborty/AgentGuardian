// src/middleware/agentAuth.ts — Agent Identity (Section 16.1.4)
import { Request, Response, NextFunction } from 'express';

const USER_ID_CLAIM  = 'https://agentguardian.com/userId';
const AGENT_ID_CLAIM = 'https://agentguardian.com/agentId';
const AGENT_SCOPE    = 'agent:act';

export function requireAgentAuth(
  req: Request, res: Response, next: NextFunction
) {
  const payload = (req as any).auth?.payload;
  if (!payload) {
    return res.status(401).json({ error: 'No token presented' });
  }

  // Verify this is an M2M agent token, not a human user token
  const scopes = ((payload.scope as string) ?? '').split(' ');
  if (!scopes.includes(AGENT_SCOPE)) {
    return res.status(403).json({
      error: 'forbidden',
      message: 'This endpoint requires agent:act scope.',
    });
  }

  // Extract the userId the agent is acting on behalf of
  const userId  = payload[USER_ID_CLAIM] as string | undefined;
  const agentId = payload[AGENT_ID_CLAIM] as string | undefined;

  if (!userId || !agentId) {
    return res.status(403).json({
      error: 'forbidden',
      message: 'Agent token is missing user binding or agent ID.',
    });
  }

  // Attach to request for downstream handlers
  (req as any).actingUserId = userId;
  (req as any).agentId = agentId;
  next();
}

// Helper to get acting user ID (works for both human and agent requests)
export function getActingUserId(req: Request): string {
  return (req as any).actingUserId ?? (req as any).auth?.payload?.sub;
}

export function getAgentId(req: Request): string | undefined {
  return (req as any).agentId;
}
