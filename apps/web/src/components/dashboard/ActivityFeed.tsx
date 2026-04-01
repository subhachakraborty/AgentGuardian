import { Mail, Github, MessageSquare, FileText, Clock } from 'lucide-react';
import { useActivityFeed } from '../../hooks/useActivityFeed';
import { TierBadge } from '../permissions/TierBadge';
import { StatusBadge } from './StatusBadge';

const serviceIcons: Record<string, { icon: typeof Mail; className: string }> = {
  GMAIL: { icon: Mail, className: 'service-icon service-gmail' },
  GITHUB: { icon: Github, className: 'service-icon service-github' },
  SLACK: { icon: MessageSquare, className: 'service-icon service-slack' },
  NOTION: { icon: FileText, className: 'service-icon service-notion' },
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export function ActivityFeed() {
  const { activities, isLoading } = useActivityFeed();

  if (isLoading) {
    return (
      <div className="card p-8 text-center text-text-muted animate-pulse">
        Loading activity feed...
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="card p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-4 flex items-center justify-center">
          <Clock className="w-8 h-8 text-text-muted" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">No activity yet</h3>
        <p className="text-text-muted text-sm">Agent actions will appear here in real-time.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-text-primary flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Activity Feed
        </h2>
      </div>
      <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
        {activities.map((entry: any) => {
          const svc = serviceIcons[entry.service] || serviceIcons.GMAIL;
          const Icon = svc.icon;

          return (
            <div
              key={entry.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50/50 transition-colors animate-fade-in"
            >
              <div className={svc.className}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {entry.actionType}
                </p>
                {entry.metadata?.displaySummary && (
                  <p className="text-xs text-text-muted truncate">{String(entry.metadata.displaySummary)}</p>
                )}
              </div>
              <TierBadge tier={entry.tier} />
              <StatusBadge status={entry.status} />
              <span className="text-xs text-text-muted whitespace-nowrap">
                {formatTime(entry.executedAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
