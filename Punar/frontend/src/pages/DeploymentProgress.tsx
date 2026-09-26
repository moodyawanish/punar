import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TimelineStep, type StepState } from '../components/TimelineStep';
import { TerminalPanel } from '../components/TerminalPanel';
import { AlertTriangle, Activity } from 'lucide-react';

const STEPS = [
  { label: 'Repository Analyzed',            sublabel: 'payment-service v2.3.0 → v2.4.0' },
  { label: 'Rehearsal Environment Created',  sublabel: 'Ephemeral PostgreSQL container' },
  { label: 'Database Snapshot Created',      sublabel: 'Production-like state cloned' },
  { label: 'V2 Migration Applied',           sublabel: 'Schema v18 → v19 · 3 migrations' },
  { label: 'V2 Started',                     sublabel: 'v2.4.0 container healthy' },
  { label: 'Representative V2 State Generated', sublabel: 'Synthetic orders with REFUNDED_PENDING' },
  { label: 'Switching Back to V1',           sublabel: 'Starting rollback version v2.3.0' },
  { label: 'Running Compatibility Tests',    sublabel: undefined },
];

const LOG_LINES = [
  { timestamp: '13:01:01', text: 'Analyzing repository payment-service',                       level: 'info'    as const },
  { timestamp: '13:01:03', text: 'Detected 3 migration files',                                 level: 'info'    as const },
  { timestamp: '13:01:05', text: 'Rehearsal environment created',                              level: 'success' as const },
  { timestamp: '13:01:08', text: 'Database snapshot created — cloning production schema',       level: 'success' as const },
  { timestamp: '13:01:12', text: 'Applying migration 017_add_phone_verified.sql...',            level: 'info'    as const },
  { timestamp: '13:01:13', text: 'Applying migration 018_drop_legacy_status.sql...',            level: 'info'    as const },
  { timestamp: '13:01:14', text: 'Applying migration 019_payment_status.sql...',               level: 'info'    as const },
  { timestamp: '13:01:15', text: 'Migration complete. Schema v19 active.',                     level: 'success' as const },
  { timestamp: '13:01:18', text: 'Starting v2.4.0...',                                         level: 'info'    as const },
  { timestamp: '13:01:21', text: 'v2.4.0 healthy.',                                            level: 'success' as const },
  { timestamp: '13:01:23', text: 'Generating V2 state...',                                     level: 'info'    as const },
  { timestamp: '13:01:25', text: 'Inserted order #5821 with status REFUNDED_PENDING.',         level: 'info'    as const },
  { timestamp: '13:01:26', text: 'Stopping V2...',                                             level: 'info'    as const },
  { timestamp: '13:01:28', text: 'Starting rollback version v2.3.0...',                        level: 'info'    as const },
  { timestamp: '13:01:31', text: 'Running compatibility tests...',                             level: 'info'    as const },
  { timestamp: '13:01:35', text: 'ERROR: Unknown payment status: REFUNDED_PENDING',            level: 'error'   as const },
  { timestamp: '13:01:35', text: 'Test failed: rollback-order-compatibility',                  level: 'error'   as const },
  { timestamp: '13:01:36', text: 'ROLLBACK COMPATIBILITY: UNSAFE',                             level: 'error'   as const },
];

export function DeploymentProgress() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const project = id ?? 'payment-service';

  const [step, setStep] = useState(0);
  const [logCount, setLogCount] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (step < STEPS.length - 1) {
      const t = setTimeout(() => setStep((s) => s + 1), 800 + step * 200);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    if (logCount < LOG_LINES.length) {
      const t = setTimeout(() => setLogCount((n) => n + 1), 400 + logCount * 220);
      return () => clearTimeout(t);
    }
    if (logCount === LOG_LINES.length) {
      const t = setTimeout(() => setFailed(true), 600);
      return () => clearTimeout(t);
    }
  }, [logCount]);

  const getState = (idx: number): StepState => {
    const lastStep = STEPS.length - 1;
    if (idx === lastStep) {
      if (failed) return 'warning';
      if (step >= lastStep) return 'active';
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
          <h1 className="text-[15px] font-semibold">Rollback Rehearsal</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5 font-mono">
            {project} · v2.3.0 → v2.4.0 · commit 84fa219
          </p>
        </div>
        {failed && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-400/10 border border-red-400/30 text-red-400 text-[13px] font-medium">
            <AlertTriangle size={14} />
            Compatibility Failure Detected
          </div>
        )}
      </header>

      <div className="px-8 py-8 max-w-[900px] space-y-5">

        {/* Failure alert */}
        {failed && (
          <div className="bg-red-400/5 border border-red-400/25 rounded-lg p-5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle size={15} className="text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-red-400">Rollback Compatibility Failure</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                V1 (v2.3.0) failed when running against the database state left by V2 (v2.4.0).
                V2 introduced a persisted enum value <span className="font-mono text-red-400">REFUNDED_PENDING</span> that V1 does not recognize.
              </p>
              <p className="text-[12px] text-muted-foreground mt-1.5">
                Failed test: <span className="font-mono text-amber-400">rollback-order-compatibility</span>
              </p>
            </div>
            <button
              onClick={() => navigate(`/projects/${project}/analysis`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors shrink-0"
            >
              <Activity size={13} />
              View Analysis
            </button>
          </div>
        )}

        <div className="grid grid-cols-[240px_1fr] gap-5">

          {/* Timeline */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-5">Rehearsal Steps</h2>
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
