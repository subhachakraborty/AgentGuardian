import { CheckCircle, XCircle, Ban, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  EXECUTED: { label: 'Executed', className: 'badge-executed', icon: CheckCircle },
  APPROVED: { label: 'Approved', className: 'badge-approved', icon: CheckCircle },
  DENIED: { label: 'Denied', className: 'badge-denied', icon: XCircle },
  EXPIRED: { label: 'Expired', className: 'badge-expired', icon: Clock },
  FAILED: { label: 'Failed', className: 'badge-denied', icon: Ban },
  STEP_UP_VERIFIED: { label: 'MFA Verified', className: 'badge-approved', icon: ShieldCheck },
  PENDING_APPROVAL: { label: 'Pending', className: 'badge-pending', icon: AlertTriangle },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'badge-expired',
    icon: Clock,
  };
  const Icon = config.icon;

  return (
    <span className={config.className}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
