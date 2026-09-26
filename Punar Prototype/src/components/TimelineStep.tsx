import { Check, Loader2, Circle } from 'lucide-react';
import { clsx } from 'clsx';

export type StepState = 'pending' | 'active' | 'done' | 'warning';

interface TimelineStepProps {
  label: string;
  state: StepState;
  isLast?: boolean;
  sublabel?: string;
}

const ICON: Record<StepState, React.ReactNode> = {
  pending: <Circle size={14} className="text-muted-foreground/30" />,
  active:  <Loader2 size={14} className="text-primary animate-spin" />,
  done:    <Check size={12} className="text-emerald-400" />,
  warning: <span className="text-amber-400 text-[11px] font-bold leading-none">!</span>,
};

const DOT_STYLE: Record<StepState, string> = {
  pending: 'border border-border bg-card',
  active:  'border border-primary/50 bg-primary/10',
  done:    'border border-emerald-400/40 bg-emerald-400/10',
  warning: 'border border-amber-400/40 bg-amber-400/10',
};

const LABEL_COLOR: Record<StepState, string> = {
  pending: 'text-muted-foreground/50',
  active:  'text-foreground',
  done:    'text-foreground',
  warning: 'text-amber-400',
};

export function TimelineStep({ label, state, isLast = false, sublabel }: TimelineStepProps) {
  return (
    <div className="flex gap-3.5">
      <div className="flex flex-col items-center">
        <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center shrink-0', DOT_STYLE[state])}>
          {ICON[state]}
        </div>
        {!isLast && <div className="w-px flex-1 bg-border mt-1.5 mb-0" />}
      </div>
      <div className={clsx('pb-5', isLast && 'pb-0')}>
        <p className={clsx('text-[13px] font-medium leading-none mt-1', LABEL_COLOR[state])}>{label}</p>
        {sublabel && (
          <p className="text-[11px] text-muted-foreground/60 font-mono mt-1">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
