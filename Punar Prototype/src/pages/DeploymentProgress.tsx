import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimelineStep, type StepState } from '../components/TimelineStep';
import { TerminalPanel } from '../components/TerminalPanel';
import { AlertTriangle, Activity } from 'lucide-react';

const STEPS = [
  { label: 'Recovery Point Created',       sublabel: 'RP-20394 — payment-service v2.3.0' },
  { label: 'Build Completed',              sublabel: 'v2.4.0 / commit 84fa219' },
  { label: 'Application Deployed',         sublabel: 'Container started in Production' },
  { label: 'Database Migration',           sublabel: 'Schema v18 → v19' },
  { label: 'Health Validation',            sublabel: undefined },
];

const LOG_LINES = [
  { timestamp: '12:42:01', text: 'Recovery Point RP-20394 created',           level: 'success' as const },
  { timestamp: '12:42:05', text: 'Starting deployment v2.4.0',                 level: 'info'    as const },
  { timestamp: '12:42:08', text: 'Build completed — 84fa219',                  level: 'success' as const },
  { timestamp: '12:42:13', text: 'Application container started',              level: 'success' as const },
  { timestamp: '12:42:16', text: 'Database migration v19 completed',           level: 'success' as const },
  { timestamp: '12:42:19', text: 'Starting post-deployment validation',         level: 'info'    as const },
  { timestamp: '12:42:25', text: 'WARNING — API error rate increasing',         level: 'warning' as const },
  { timestamp: '12:42:27', text: 'WARNING — Database query latency abnormal',   level: 'warning' as const },
  { timestamp: '12:42:29', text: 'ALERT — Health check threshold exceeded',   level: 'error'   as const },
];

export function DeploymentProgress() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [logCount, setLogCount] = useState(0);
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    if (step < 4) {
      const t = setTimeout(() => setStep((s) => s + 1), 900 + step * 300);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    if (logCount < LOG_LINES.length) {
      const t = setTimeout(() => setLogCount((n) => n + 1), 500 + logCount * 350);
      return () => clearTimeout(t);
    }
    if (logCount === LOG_LINES.length) {
      const t = setTimeout(() => setDegraded(true), 800);
      return () => clearTimeout(t);
    }
  }, [logCount]);

  const getState = (idx: number): StepState => {
    if (idx === 4) {
      if (degraded) return 'warning';
      if (step >= 4) return 'active';
      return 'pending';
    }
    if (idx < step) return 'done';
    if (idx === step) return 'active';
    return 'pending';
  };

  return (
    <div className="min-h-full">
      <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h1 className="text-[15px] font-semibold">Deploying v2.4.0</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5 font-mono">
            payment-service · Production · commit 84fa219
          </p>
        </div>
        {degraded && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[13px] font-medium">
            <AlertTriangle size={14} />
            Degradation Detected
          </div>
        )}
      </header>

      <div className="px-8 py-8 max-w-[900px] space-y-5">

        {/* Degradation alert */}
        {degraded && (
          <div className="bg-red-400/5 border border-red-400/25 rounded-lg p-5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle size={15} className="text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-red-400">Deployment Degradation Detected</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                v2.4.0 is causing health degradation in Production. API error rate spiked to 18.4%
                and database query latency is 982ms (baseline 8ms).
              </p>
              <p className="text-[12px] text-muted-foreground mt-1.5">
                Recovery Point <span className="font-mono text-indigo-400">RP-20394</span> is available.
                Punar analysis is running.
              </p>
            </div>
            <button
              onClick={() => navigate('/monitoring')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors shrink-0"
            >
              <Activity size={13} />
              View Monitoring
            </button>
          </div>
        )}

        <div className="grid grid-cols-[240px_1fr] gap-5">

          {/* Timeline */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-5">Progress</h2>
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

          {/* Terminal */}
          <TerminalPanel lines={LOG_LINES.slice(0, logCount)} className="h-full" />
        </div>

      </div>
    </div>
  );
}
