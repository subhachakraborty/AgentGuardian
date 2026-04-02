// src/middleware/stepUpAuth.ts — ACR Claim Verification (Section 4.5.1)
import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { env } from '../config/env';
import { JWKS } from '../lib/jwksClient';

const MFA_ACR = 'http://schemas.openid.net/pape/policies/2007/06/multi-factor';

export async function requireStepUp(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  let decoded;
  try {
    decoded = await jwtVerify(token, JWKS);
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token', message: 'Token verification failed' });
  }

  const acr = decoded.payload?.acr as string | undefined;

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
    `client_id=${encodeURIComponent(env.AUTH0_CLIENT_ID)}&` +
    `scope=openid&` +
    `acr_values=${encodeURIComponent(MFA_ACR)}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(env.FRONTEND_URL + '/callback')}&` +
    `state=${encodeURIComponent(JSON.stringify({ stepUp: true, jobId }))}`;
}
