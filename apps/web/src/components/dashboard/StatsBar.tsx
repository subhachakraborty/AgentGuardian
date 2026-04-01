import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Activity, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export function StatsBar() {
  const { data: stats } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/audit/stats');
      return res.data;
    },
    refetchInterval: 30_000,
  });

  const cards = [
    {
      label: 'Total Actions',
      value: stats?.totalActions ?? 0,
      icon: Activity,
      gradient: 'from-brand to-accent',
    },
    {
      label: 'Auto (Silent)',
      value: stats?.byTier?.AUTO ?? 0,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Nudge (Approved)',
      value: stats?.byTier?.NUDGE ?? 0,
      icon: Shield,
      gradient: 'from-amber-500 to-amber-600',
    },
    {
      label: 'Step-Up (MFA)',
      value: stats?.byTier?.STEP_UP ?? 0,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, gradient }) => (
        <div key={label} className="card p-5 hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium">{label}</p>
              <p className="text-3xl font-bold mt-1 text-text-primary">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
