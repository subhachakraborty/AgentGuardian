import { Mail, Github, MessageSquare, FileText, ExternalLink } from 'lucide-react';

interface ServiceCardProps {
  service: string;
  status: string;
  connectedAt?: string;
  lastUsedAt?: string;
  onConnect: () => void;
  onRevoke: () => void;
  isConnecting?: boolean;
}

const serviceInfo: Record<string, { name: string; icon: typeof Mail; className: string; description: string }> = {
  GMAIL: {
    name: 'Gmail',
    icon: Mail,
    className: 'service-gmail',
    description: 'Read, send, and manage emails',
  },
  GITHUB: {
    name: 'GitHub',
    icon: Github,
    className: 'service-github',
    description: 'Manage issues, PRs, and repositories',
  },
  SLACK: {
    name: 'Slack',
    icon: MessageSquare,
    className: 'service-slack',
    description: 'Read and post messages to channels',
  },
  NOTION: {
    name: 'Notion',
    icon: FileText,
    className: 'service-notion',
    description: 'Read and manage pages and databases',
  },
};

export function ServiceCard({
  service, status, connectedAt, lastUsedAt, onConnect, onRevoke, isConnecting
}: ServiceCardProps) {
  const info = serviceInfo[service] || serviceInfo.GMAIL;
  const Icon = info.icon;
  const isActive = status === 'ACTIVE';
  const isRevoked = status === 'REVOKED';

  return (
    <div className={`card p-6 ${isRevoked ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        <div className={`service-icon ${info.className} !w-12 !h-12 !rounded-xl !text-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-text-primary">{info.name}</h3>
            {isActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            )}
            {isRevoked && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
                Revoked
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted mb-3">{info.description}</p>

          {isActive && (
            <div className="text-xs text-text-muted space-y-1">
              {connectedAt && <p>Connected: {new Date(connectedAt).toLocaleDateString()}</p>}
              {lastUsedAt && <p>Last used: {new Date(lastUsedAt).toLocaleDateString()}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        {isActive ? (
          <button onClick={onRevoke} className="btn-danger w-full !text-sm">
            Revoke Access
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="btn-primary w-full !text-sm"
          >
            {isConnecting ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Connect {info.name}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
