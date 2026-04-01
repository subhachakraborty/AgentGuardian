// src/services/tokenVault.ts — Token Vault wrapper with error handling (Section 16.7)
import { auth0Management } from '../config/auth0';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

const serviceConnectionMap: Record<string, string> = {
  gmail: 'google-gmail',
  github: 'github',
  slack: 'slack',
  notion: 'notion',
};

// Custom error classes for clean upstream handling
export class ServiceNotConnectedError extends Error {
  constructor(public service: string) {
    super(`Service '${service}' is not connected for this user.`);
    this.name = 'ServiceNotConnectedError';
  }
}

export class TokenExpiredError extends Error {
  constructor(public service: string) {
    super(`Refresh token for '${service}' is expired. User must reconnect.`);
    this.name = 'TokenExpiredError';
  }
}

export async function getServiceToken(
  userId: string,
  service: 'gmail' | 'github' | 'slack' | 'notion'
): Promise<string> {
  try {
    // Auth0 Token Vault API — returns short-lived access token
    const connection = serviceConnectionMap[service];
    if (!connection) {
      throw new ServiceNotConnectedError(service);
    }

    // In production, this calls auth0Management.users.getTokenVaultToken()
    // For now, we attempt the Token Vault API call
    const response = await (auth0Management as any).tokenVault?.getToken?.({
      userId,
      connection,
    });

    if (!response?.access_token) {
      // Fallback: try the federated token endpoint
      const tokenResp = await (auth0Management as any).users?.getToken?.({
        id: userId,
        connection,
      });

      if (!tokenResp?.access_token) {
        throw new Error('Token Vault returned empty token');
      }
      return tokenResp.access_token;
    }

    return response.access_token;
  } catch (err: any) {
    logger.error('Token Vault error', {
      service,
      userId,
      error: err.message,
      statusCode: err.statusCode,
    });

    if (err instanceof ServiceNotConnectedError) throw err;
    if (err instanceof TokenExpiredError) throw err;

    if (err.statusCode === 404) {
      throw new ServiceNotConnectedError(service);
    }
    if (err.statusCode === 401) {
      // Refresh token invalid — user must reconnect
      await markConnectionRevoked(userId, service);
      throw new TokenExpiredError(service);
    }
    throw err;
  }
}

async function markConnectionRevoked(userId: string, service: string): Promise<void> {
  try {
    await prisma.serviceConnection.updateMany({
      where: {
        userId,
        service: service.toUpperCase() as any,
        status: 'ACTIVE',
      },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });
    logger.warn('Service connection marked as revoked', { userId, service });
  } catch (err: any) {
    logger.error('Failed to mark connection as revoked', { error: err.message });
  }
}
