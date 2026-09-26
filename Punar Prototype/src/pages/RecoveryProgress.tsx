import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimelineStep, type StepState } from '../components/TimelineStep';
import { TerminalPanel } from '../components/TerminalPanel';
import { RotateCcw } from 'lucide-react';

const STEPS = [
  { label: 'Isolating unhealthy deployment',   sublabel: 'Removing v2.4.0 from load balancer' },
  { label: 'Stopping v2.4.0',                   sublabel: 'Container shutdown initiated'         },
  { label: 'Restoring application v2.3.0',      sublabel: 'Loading from Recovery Point RP-20394' },
  { label: 'Restoring database Schema v18',     sublabel: 'Applying database snapshot'           },
  { label: 'Restoring environment config',      sublabel: 'Environment variables applied'        },
  { label: 'Starting services',                 sublabel: 'Container health check pending'       },
  { label: 'Running health validation',         sublabel: 'Validating all service endpoints'     },
  { label: 'Restoring production traffic',      sublabel: 'Routing traffic to v2.3.0'           },
];

const LOG_LINES = [
  { timestamp: '12:44:02', text: 'Recovery initiated — Loading RP-20394',               level: 'info'    as const },
  { timestamp: '12:44:03', text: 'Removing v2.4.0 from load balancer',                   level: 'info'    as const },
  { timestamp: '12:44:04', text: 'Container v2.4.0 isolation complete',                  level: 'success' as const },
  { timestamp: '12:44:05', text: 'Stopping v2.4.0 container',                            level: 'info'    as const },
  { timestamp: '12:44:07', text: 'Application v2.3.0 restored from snapshot',            level: 'success' as const },
  { timestamp: '12:44:10', text: 'Starting database restore — Schema v18',               level: 'info'    as const },
  { timestamp: '12:44:15', text: 'Database snapshot restored — Schema v18',              level: 'success' as const },
  { timestamp: '12:44:18', text: 'Environment configuration applied',                    level: 'success' as const },
  { timestamp: '12:44:22', text: 'Starting services...',                                  level: 'info'    as const },
  { timestamp: '12:44:29', text: 'Running health checks on all endpoints',               level: 'info'    as const },
  { timestamp: '12:44:35', text: 'payment-service — HEALTHY',                            level: 'success' as const },
  { timestamp: '12:44:36', text: 'API error rate: 0.6% — within normal range',          level: 'success' as const },
  { timestamp: '12:44:38', text: 'Production traffic restored to v2.3.0',                level: 'success' as const },
  { timestamp: '12:44:44', text: 'Recovery complete — Total duration: 42 seconds',       level: 'success' as const },
];

export function RecoveryProgress() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [logCount, setLogCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (step < STEPS.length) {
      const delay = step < 4 ? 600 : step < 7 ? 900 : 700;
      const t = setTimeout(() => setStep((s) => s + 1), delay);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    if (logCount < LOG_LINES.length) {
      const t = setTimeout(() => setLogCount((n) => n + 1), 350 + logCount * 150);
      return () => clearTimeout(t);
    }
    if (logCount === LOG_LINES.length) {
      const t = setTimeout(() => setDone(true), 600);
      return () => clearTimeout(t);
    }
  }, [logCount]);

  const getState = (idx: number): StepState => {
    if (idx < step) return 'done';
    if (idx === step && step < STEPS.length) return 'active';
    return 'pending';
  };

  return (
    <div className="min-h-full">
      <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <RotateCcw size={15} className="text-primary animate-spin" style={{ animationDuration: '2s' }} />
          <div>
            <h1 className="text-[15px] font-semibold">Recovering Production</h1>
            <p className="text-[12px] text-muted-foreground font-mono mt-0.5">
              payment-service · RP-20394 · v2.4.0 → v2.3.0
            </p>
          </div>
        </div>
        {done && (
          <button
            onClick={() => navigate('/recovery/success')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-500 text-white text-[13px] font-semibold hover:bg-emerald-500/90 transition-colors"
          >
            Recovery Complete — View Summary
          </button>
        )}
      </header>

      <div className="px-8 py-8 max-w-[900px] space-y-5">
        <div className="grid grid-cols-[280px_1fr] gap-5">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-5">Recovery Steps</h2>
            {STEPS.map((s, i) => (
              <TimelineStep
                key={s.label}
                label={s.label}
                sublabel={s.sublabel}
                state={getState(i)}
                isLast={i === STEPS.length - 1}
              />
            ))}
          </div>
          <TerminalPanel lines={LOG_LINES.slice(0, logCount)} className="h-full" />
        </div>
      </div>
    </div>
  );
}
