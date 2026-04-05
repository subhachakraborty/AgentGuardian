import { TopNav } from '../components/layout/TopNav';
import { usePermissions } from '../hooks/usePermissions';
import { TierSelector } from '../components/permissions/TierBadge';
import { Mail, Github, MessageSquare, FileText, RotateCcw } from 'lucide-react';

const serviceIcons: Record<string, { icon: typeof Mail; name: string; color: string }> = {
  GMAIL: { icon: Mail, name: 'Gmail', color: 'text-red-500' },
  GITHUB: { icon: Github, name: 'GitHub', color: 'text-gray-800' },
  SLACK: { icon: MessageSquare, name: 'Slack', color: 'text-purple-600' },
  NOTION: { icon: FileText, name: 'Notion', color: 'text-gray-900' },
};

export function Permissions() {
  const { permissions, isLoading, updatePermission, resetService } = usePermissions();

  const handleTierChange = (service: string, actionType: string, tier: string) => {
    updatePermission.mutate({ service, actionType, tier });
  };

  // Group permissions by service
  const grouped = (permissions || []).reduce((acc: any, perm: any) => {
    if (!acc[perm.service]) acc[perm.service] = [];
    acc[perm.service].push(perm);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <>
      <TopNav
        title="Permissions"
        subtitle="Configure the trust level for each action your agent can take"
      />
      <div className="p-8 space-y-6">
        <div className="card p-4">
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-tier-auto" /> Auto — Executes silently
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-tier-nudge" /> Nudge — Requires approval (60s window)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-tier-stepup" /> Step-Up — Requires MFA
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="card p-12 text-center text-text-muted animate-pulse">
            Loading permissions...
          </div>
        ) : (
          Object.entries(grouped).map(([service, perms]: [string, any]) => {
            const svc = serviceIcons[service];
            const Icon = svc?.icon || Mail;

            return (
              <div key={service} className="card overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/50 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${svc?.color || 'text-gray-500'}`} />
                    <h2 className="font-semibold text-text-primary">{svc?.name || service}</h2>
                    <span className="text-xs text-text-muted bg-slate-200 px-2 py-0.5 rounded-full">
                      {perms.length} actions
                    </span>
                  </div>
                  <button
                    className="btn-ghost !text-xs !py-1 !px-3 disabled:opacity-50"
                    onClick={() => resetService.mutate(service)}
                    disabled={resetService.isPending}
                  >
                    <RotateCcw className={`w-3 h-3 ${resetService.isPending ? 'animate-spin' : ''}`} />
                    Reset to defaults
                  </button>
                </div>
                <div className="divide-y divide-border">
                  {perms.map((perm: any) => (
                    <div
                      key={perm.actionType}
                      className="flex items-center justify-between px-6 py-3 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary font-mono">
                          {perm.actionType}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">{perm.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {perm.isCustom && (
                          <span className="text-[10px] text-accent font-medium bg-accent/10 px-2 py-0.5 rounded-full">
                            Custom
                          </span>
                        )}
                        <TierSelector
                          value={perm.currentTier}
                          onChange={(tier) => handleTierChange(perm.service, perm.actionType, tier)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
