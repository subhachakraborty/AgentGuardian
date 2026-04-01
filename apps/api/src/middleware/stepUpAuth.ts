// src/middleware/stepUpAuth.ts — ACR Claim Verification (Section 4.5.1)
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const MFA_ACR = 'http://schemas.openid.net/pape/policies/2007/06/multi-factor';

export function requireStepUp(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  const decoded = jwt.decode(token) as Record<string, unknown>;
  const acr = decoded?.acr as string | undefined;

  if (!acr || !acr.includes(MFA_ACR)) {
    return res.status(403).json({
      error: 'step_up_required',
      message: 'This action requires MFA verification.',
      challengeUrl: generateChallengeUrl(req),
    });
  }
  next();
}

function generateChallengeUrl(req: Request): string {
  const jobId = req.params.jobId || '';
  return `https://${env.AUTH0_DOMAIN}/authorize?` +
    `audience=${encodeURIComponent(env.AUTH0_AUDIENCE)}&` +
    `scope=openid&` +
    `acr_values=${encodeURIComponent(MFA_ACR)}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(env.FRONTEND_URL + '/callback')}&` +
    `state=${encodeURIComponent(JSON.stringify({ stepUp: true, jobId }))}`;
}
