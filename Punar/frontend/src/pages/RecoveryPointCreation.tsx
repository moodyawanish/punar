import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimelineStep, type StepState } from '../components/TimelineStep';
import { Archive, Shield, Rocket } from 'lucide-react';

const STEPS = [
  'Analyzing deployment changes',
  'Capturing application state',
  'Creating database snapshot',
  'Saving environment configuration',
  'Recording deployment metadata',
  'Recovery Point created',
];

export function RecoveryPointCreation() {
  const navigate = useNavigate();
  const [completedCount, setCompletedCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (completedCount >= STEPS.length) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setCompletedCount((n) => n + 1), 600 + completedCount * 200);
    return () => clearTimeout(t);
  }, [completedCount]);

  const getState = (idx: number): StepState => {
    if (idx < completedCount) return 'done';
    if (idx === completedCount) return 'active';
    return 'pending';
  };

  return (
    <div className="min-h-full flex flex-col">
      <header className="h-14 border-b border-border flex items-center px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <Shield size={15} className="text-primary" />
          <span className="text-[15px] font-semibold">Preparing Safe Deployment</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary border border-border text-muted-foreground">
            payment-service
          </span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-[580px] space-y-6">

          {/* Progress card */}
          <div className="bg-card border border-border rounded-lg p-8">
            <p className="text-[12px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-6">
              Creating Recovery Point
            </p>
            <div>
              {STEPS.map((label, i) => (
                <TimelineStep
                  key={label}
                  label={label}
                  state={getState(i)}
                  isLast={i === STEPS.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Recovery point details — visible once done */}
          {done && (
            <div className="bg-card border border-primary/20 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Archive size={15} />
                <span className="text-[14px] font-semibold">Recovery Point Ready</span>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Recovery Point</p>
                  <span className="font-mono text-[18px] font-bold text-primary">RP-20394</span>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Application</p>
                  <span className="font-mono text-[14px] font-semibold text-foreground">v2.3.0</span>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Current Database</p>
                  <span className="font-mono text-[14px] font-semibold text-foreground">Schema v18</span>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Incoming</p>
                  <div className="font-mono text-[13px] text-muted-foreground/70">
                    <span className="text-foreground">v2.4.0</span> / Schema v19
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <button
                  onClick={() => navigate('/deployments/progress')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Rocket size={14} />
                  Continue Deployment
                </button>
              </div>
            </div>
          )}

          {!done && (
            <p className="text-center text-[12px] text-muted-foreground/50 font-mono">
              Do not close this window — capturing production state...
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
