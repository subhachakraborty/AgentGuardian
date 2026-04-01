import { Bell, Search } from 'lucide-react';
import { useActivityStore } from '../../stores/activityStore';

interface TopNavProps {
  title: string;
  subtitle?: string;
}

export function TopNav({ title, subtitle }: TopNavProps) {
  const pendingCount = useActivityStore((s) => s.pendingActions.length);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-border px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand">{title}</h1>
          {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search actions..."
              className="pl-10 pr-4 py-2 w-64 rounded-lg border border-border bg-surface text-sm
                         focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
                         transition-all"
            />
          </div>

          {/* Notification bell */}
          <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <Bell className="w-5 h-5 text-text-muted" />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-tier-nudge
                               text-[10px] font-bold text-white flex items-center justify-center
                               animate-pulse-slow">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
