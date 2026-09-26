import { clsx } from 'clsx';

export type StatusType =
  | 'healthy'
  | 'protected'
  | 'deploying'
  | 'degraded'
  | 'critical'
  | 'recovered'
  | 'failed'
  | 'ready'
  | 'pending';

const STATUS_CONFIG: Record<StatusType, { dot: string; text: string; label: string; pillBg: string }> = {
  healthy:   { dot: 'bg-emerald-400',  text: 'text-emerald-400',  label: 'Healthy',    pillBg: 'bg-emerald-400/10 text-emerald-400' },
  protected: { dot: 'bg-emerald-400',  text: 'text-emerald-400',  label: 'Protected',  pillBg: 'bg-emerald-400/10 text-emerald-400' },
  recovered: { dot: 'bg-emerald-400',  text: 'text-emerald-400',  label: 'Recovered',  pillBg: 'bg-emerald-400/10 text-emerald-400' },
  ready:     { dot: 'bg-indigo-400',   text: 'text-indigo-400',   label: 'Ready',      pillBg: 'bg-indigo-400/10 text-indigo-400'   },
  deploying: { dot: 'bg-indigo-400',   text: 'text-indigo-400',   label: 'Deploying',  pillBg: 'bg-indigo-400/10 text-indigo-400'   },
  degraded:  { dot: 'bg-amber-400',    text: 'text-amber-400',    label: 'Degraded',   pillBg: 'bg-amber-400/10 text-amber-400'     },
  critical:  { dot: 'bg-red-400',      text: 'text-red-400',      label: 'Critical',   pillBg: 'bg-red-400/10 text-red-400'         },
  failed:    { dot: 'bg-red-400',      text: 'text-red-400',      label: 'Failed',     pillBg: 'bg-red-400/10 text-red-400'         },
  pending:   { dot: 'bg-slate-500',    text: 'text-slate-400',    label: 'Pending',    pillBg: 'bg-slate-500/10 text-slate-400'     },
};

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
  pill?: boolean;
}

export function StatusBadge({ status, label, className, pill = false }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const displayLabel = label ?? cfg.label;

  if (pill) {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium',
          cfg.pillBg,
          className
        )}
      >
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full shrink-0',
            cfg.dot,
            status === 'deploying' && 'animate-pulse'
          )}
        />
        {displayLabel}
      </span>
    );
  }

  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-[12px] font-medium', className)}>
      <span
        className={clsx(
          'w-1.5 h-1.5 rounded-full shrink-0',
          cfg.dot,
          status === 'deploying' && 'animate-pulse'
        )}
      />
      <span className={cfg.text}>{displayLabel}</span>
    </span>
  );
}
