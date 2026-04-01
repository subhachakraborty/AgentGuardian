import { ActionTier, ServiceType } from './actions';

// ─── Permission Config ──────────────────────────────────
export interface PermissionConfig {
  id: string;
  userId: string;
  service: ServiceType;
  actionType: string;
  tier: ActionTier;
  createdAt: string;
  updatedAt: string;
}

// ─── Permission Config Input (for upsert) ───────────────
export interface PermissionConfigInput {
  service: ServiceType;
  actionType: string;
  tier: ActionTier;
}

// ─── Permission Rule (display) ──────────────────────────
export interface PermissionRule {
  service: ServiceType;
  actionType: string;
  description: string;
  currentTier: ActionTier;
  defaultTier: ActionTier;
  isCustom: boolean;
}

// ─── Socket Events ──────────────────────────────────────
export interface SocketEvents {
  'activity:new': { auditLog: import('./audit').AuditLogEntry };
  'nudge:request': { pendingAction: import('./audit').PendingActionEntry };
  'nudge:expired': { jobId: string };
  'nudge:resolved': { jobId: string; status: string; resolvedBy?: string };
  'stepup:required': { jobId: string; challengeUrl: string };
  'stepup:completed': { jobId: string; auditLog: import('./audit').AuditLogEntry };
  'connection:revoked': { service: ServiceType };
}
