interface TierBadgeProps {
  tier: string;
  onClick?: () => void;
  interactive?: boolean;
}

const tierConfig: Record<string, { label: string; emoji: string; className: string }> = {
  AUTO: { label: 'Auto', emoji: '🟢', className: 'badge-auto' },
  NUDGE: { label: 'Nudge', emoji: '🟡', className: 'badge-nudge' },
  STEP_UP: { label: 'Step-Up', emoji: '🔴', className: 'badge-stepup' },
};

export function TierBadge({ tier, onClick, interactive }: TierBadgeProps) {
  const config = tierConfig[tier] || tierConfig.AUTO;

  return (
    <span
      className={`${config.className} ${interactive ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      onClick={onClick}
    >
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
}

// Three-state tier selector
interface TierSelectorProps {
  value: string;
  onChange: (tier: string) => void;
}

export function TierSelector({ value, onChange }: TierSelectorProps) {
  const tiers = ['AUTO', 'NUDGE', 'STEP_UP'] as const;

  return (
    <div className="inline-flex rounded-lg border border-border overflow-hidden">
      {tiers.map((tier) => {
        const config = tierConfig[tier];
        const isActive = value === tier;

        return (
          <button
            key={tier}
            onClick={() => onChange(tier)}
            className={`px-3 py-1.5 text-xs font-medium transition-all duration-150
              ${isActive
                ? tier === 'AUTO' ? 'bg-emerald-100 text-emerald-800'
                  : tier === 'NUDGE' ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
                : 'bg-white text-text-muted hover:bg-slate-50'
              }`}
          >
            {config.emoji} {config.label}
          </button>
        );
      })}
    </div>
  );
}
