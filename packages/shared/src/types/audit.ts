import { ActionTier, ServiceType } from './actions';

// ─── Audit Statuses ─────────────────────────────────────
export enum AuditStatus {
  EXECUTED = 'EXECUTED',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
  STEP_UP_VERIFIED = 'STEP_UP_VERIFIED',
}

// ─── Pending Action Statuses ────────────────────────────
export enum PendingStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  EXPIRED = 'EXPIRED',
}

// ─── Connection Status ──────────────────────────────────
export enum ConnectionStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
}

// ─── Audit Log Entry ────────────────────────────────────
export interface AuditLogEntry {
  id: string;
  userId: string;
  agentId?: string;
  connectionId?: string;
  service: ServiceType;
  actionType: string;
  tier: ActionTier;
  status: AuditStatus;
  payloadHash?: string;
  metadata?: Record<string, unknown>;
  approvedByUserId?: string;
  approvedByIp?: string;
  stepUpVerified: boolean;
  executedAt: string;
}

// ─── Pending Action Entry ───────────────────────────────
export interface PendingActionEntry {
  id: string;
  userId: string;
  agentId: string;
  service: ServiceType;
  actionType: string;
  tier: ActionTier;
  status: PendingStatus;
  payloadHash: string;
  displaySummary: string;
  bullJobId?: string;
  expiresAt: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedByUserId?: string;
  resolvedByIp?: string;
  resolvedByDevice?: string;
  stepUpVerified: boolean;
}

// ─── Service Connection Entry ───────────────────────────
export interface ServiceConnectionEntry {
  id: string;
  userId: string;
  service: ServiceType;
  status: ConnectionStatus;
  connectedAt: string;
  lastUsedAt?: string;
  revokedAt?: string;
}

// ─── Audit Stats ────────────────────────────────────────
export interface AuditStats {
  totalActions: number;
  byTier: Record<ActionTier, number>;
  byService: Record<ServiceType, number>;
  byStatus: Record<AuditStatus, number>;
  last7DaysTrend: { date: string; count: number }[];
}
