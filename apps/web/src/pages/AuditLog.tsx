import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { TopNav } from '../components/layout/TopNav';
import { TierBadge } from '../components/permissions/TierBadge';
import { StatusBadge } from '../components/dashboard/StatusBadge';
import { Mail, Github, MessageSquare, FileText, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const serviceIcons: Record<string, { icon: typeof Mail; className: string }> = {
  GMAIL: { icon: Mail, className: 'service-icon service-gmail' },
  GITHUB: { icon: Github, className: 'service-icon service-github' },
  SLACK: { icon: MessageSquare, className: 'service-icon service-slack' },
  NOTION: { icon: FileText, className: 'service-icon service-notion' },
};

export function AuditLog() {
  const [filters, setFilters] = useState({
    service: '',
    tier: '',
    status: '',
    limit: 20,
    offset: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs-page', filters],
    queryFn: async () => {
      const params: any = { limit: filters.limit, offset: filters.offset };
      if (filters.service) params.service = filters.service;
      if (filters.tier) params.tier = filters.tier;
      if (filters.status) params.status = filters.status;
      const res = await apiClient.get('/audit', { params });
      return res.data;
    },
  });

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const page = Math.floor(filters.offset / filters.limit) + 1;
  const totalPages = Math.ceil(total / filters.limit);

  return (
    <>
      <TopNav title="Audit Log" subtitle="Complete history of all agent actions and decisions" />
      <div className="p-8 space-y-4">
        {/* Filters */}
        <div className="card p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Filter className="w-4 h-4" />
              Filters:
            </div>
            <select
              value={filters.service}
              onChange={(e) => setFilters({ ...filters, service: e.target.value, offset: 0 })}
              className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-accent/20"
            >
              <option value="">All Services</option>
              <option value="GMAIL">Gmail</option>
              <option value="GITHUB">GitHub</option>
              <option value="SLACK">Slack</option>
              <option value="NOTION">Notion</option>
            </select>
            <select
              value={filters.tier}
              onChange={(e) => setFilters({ ...filters, tier: e.target.value, offset: 0 })}
              className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-accent/20"
            >
              <option value="">All Tiers</option>
              <option value="AUTO">🟢 Auto</option>
              <option value="NUDGE">🟡 Nudge</option>
              <option value="STEP_UP">🔴 Step-Up</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, offset: 0 })}
              className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-accent/20"
            >
              <option value="">All Statuses</option>
              <option value="EXECUTED">Executed</option>
              <option value="APPROVED">Approved</option>
              <option value="DENIED">Denied</option>
              <option value="EXPIRED">Expired</option>
              <option value="FAILED">Failed</option>
              <option value="STEP_UP_VERIFIED">MFA Verified</option>
            </select>
            <span className="text-xs text-text-muted ml-auto">
              {total} total entries
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-text-muted animate-pulse">Loading audit log...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Timestamp</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Service</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Tier</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Approved By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log: any) => {
                  const svc = serviceIcons[log.service];
                  const Icon = svc?.icon || Mail;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-text-muted font-mono">
                        {new Date(log.executedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={svc?.className || 'service-icon service-gmail'}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-medium">{log.service}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-text-primary">{log.actionType}</span>
                      </td>
                      <td className="px-4 py-3">
                        <TierBadge tier={log.tier} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="px-4 py-3">
                        {log.approvedByUserId ? (
                          <span className="text-xs text-text-muted">{log.approvedByUserId.substring(0, 20)}...</span>
                        ) : log.stepUpVerified ? (
                          <span className="text-xs text-emerald-600 font-medium">MFA ✓</span>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-slate-50/50">
              <span className="text-xs text-text-muted">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, offset: Math.max(0, filters.offset - filters.limit) })}
                  disabled={page <= 1}
                  className="btn-ghost !py-1 !px-2 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFilters({ ...filters, offset: filters.offset + filters.limit })}
                  disabled={page >= totalPages}
                  className="btn-ghost !py-1 !px-2 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
