import { clsx } from 'clsx';
import { Check, Loader2, X } from 'lucide-react';

export type StepStatus = 'done' | 'running' | 'failed' | 'pending';

export interface TimelineStep {
  label: string;
  status: StepStatus;
  note?: string;
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'done') {
    return (
      <div className="w-6 h-6 rounded-full bg-emerald-400/15 border border-emerald-400/40 flex items-center justify-center shrink-0">
        <Check size={11} className="text-emerald-400" strokeWidth={2.5} />
      </div>
    );
  }
  if (status === 'running') {
    return (
      <div className="w-6 h-6 rounded-full bg-indigo-400/15 border border-indigo-400/40 flex items-center justify-center shrink-0">
        <Loader2 size={11} className="text-indigo-400 animate-spin" />
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="w-6 h-6 rounded-full bg-red-400/15 border border-red-400/40 flex items-center justify-center shrink-0">
        <X size={11} className="text-red-400" strokeWidth={2.5} />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
      <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
    </div>
  );
}

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const prevDone = i > 0 && steps[i - 1].status === 'done';
        const lineColor = prevDone ? 'bg-emerald-400/30' : 'bg-border';

        return (
          <div key={i} className="flex gap-3">
            {/* Left column: icon + connector */}
            <div className="flex flex-col items-center">
              <StepIcon status={step.status} />
              {!isLast && (
                <div className={clsx('w-px flex-1 mt-1 mb-1 min-h-[16px]', lineColor)} />
              )}
            </div>
            {/* Content */}
            <div className={clsx('pb-4 min-w-0', isLast && 'pb-0')}>
              <p
                className={clsx(
                  'text-[13px] font-medium leading-6',
                  step.status === 'done' && 'text-foreground',
                  step.status === 'running' && 'text-indigo-400',
                  step.status === 'failed' && 'text-red-400',
                  step.status === 'pending' && 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
              {step.note && (
                <p className="text-[11px] text-muted-foreground mt-0.5">{step.note}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
