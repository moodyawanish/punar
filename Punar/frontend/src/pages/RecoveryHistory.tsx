import { Link } from 'react-router-dom';
import { ChevronRight, GitCompare } from 'lucide-react';
import { clsx } from 'clsx';

const CHECKS = [
  {
    id: 'CHK-2028', project: 'payment-service',
    fromVersion: 'v2.3.0', toVersion: 'v2.4.0',
    migrations: 3, testsRun: 18, testsPassed: 16,
    status: 'unsafe'  as const, time: '15 min ago',
  },
  {
    id: 'CHK-2014', project: 'authentication-api',
    fromVersion: 'v5.1.1', toVersion: 'v5.1.2',
    migrations: 1, testsRun: 12, testsPassed: 12,
    status: 'safe'    as const, time: '1 day ago',
  },
  {
    id: 'CHK-2009', project: 'inventory-service',
    fromVersion: 'v3.4.0', toVersion: 'v3.4.1',
    migrations: 2, testsRun: 14, testsPassed: 13,
    status: 'warning' as const, time: '5 days ago',
  },
  {
    id: 'CHK-2001', project: 'payment-service',
    fromVersion: 'v2.2.5', toVersion: 'v2.3.0',
    migrations: 1, testsRun: 16, testsPassed: 16,
    status: 'safe'    as const, time: '1 week ago',
  },
  {
    id: 'CHK-1997', project: 'customer-dashboard',
    fromVersion: 'v1.0.3', toVersion: 'v1.0.4',
    migrations: 0, testsRun: 10, testsPassed: 10,
    status: 'safe'    as const, time: '2 weeks ago',
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  safe:    { label: 'SAFE',    color: 'text-emerald-400', dot: 'bg-emerald-400', bg: 'bg-emerald-400/10' },
  unsafe:  { label: 'UNSAFE',  color: 'text-red-400',     dot: 'bg-red-400',     bg: 'bg-red-400/10'     },
  warning: { label: 'WARNING', color: 'text-amber-400',   dot: 'bg-amber-400',   bg: 'bg-amber-400/10'   },
};

export function RecoveryHistory() {
  const totalSafe    = CHECKS.filter(c => c.status === 'safe').length;
  const totalUnsafe  = CHECKS.filter(c => c.status === 'unsafe').length;
  const totalWarning = CHECKS.filter(c => c.status === 'warning').length;

  return (
    <div className="min-h-full">
      <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h1 className="text-[15px] font-semibold">Rollback Check History</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">All pre-deployment rollback compatibility checks.</p>
        </div>
        <div className="flex items-center gap-4 font-mono text-[12px] text-muted-foreground">
          <span><span className="text-emerald-400 font-semibold">{totalSafe}</span> safe</span>
          <span><span className="text-amber-400 font-semibold">{totalWarning}</span> warning</span>
          <span><span className="text-red-400 font-semibold">{totalUnsafe}</span> unsafe</span>
        </div>
      </header>

      <div className="px-8 py-8 max-w-[1060px] space-y-3">
        {CHECKS.map((chk) => {
          const s = STATUS_CONFIG[chk.status];
          return (
            <div
              key={chk.id}
              className="bg-card border border-border rounded-lg px-6 py-5 flex items-center justify-between hover:border-border/60 hover:bg-white/[0.008] transition-colors"
            >
              <div className="flex items-center gap-8">
                <div className="min-w-[80px]">
                  <p className="text-[11px] text-muted-foreground mb-0.5">Check ID</p>
                  <span className="font-mono text-[14px] font-semibold text-foreground">{chk.id}</span>
                </div>
                <div className="min-w-[140px]">
                  <p className="text-[11px] text-muted-foreground mb-0.5">Project</p>
                  <Link to={`/projects/${chk.project}`} className="font-mono text-[13px] text-foreground/80 hover:text-foreground hover:underline transition-colors">
                    {chk.project}
                  </Link>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1.5">Versions</p>
                  <div className="flex items-center gap-2 font-mono text-[13px]">
                    <span className="text-muted-foreground">{chk.fromVersion}</span>
                    <GitCompare size={11} className="text-muted-foreground/40" />
                    <span className="text-foreground">{chk.toVersion}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1.5">Migrations</p>
                  <span className="font-mono text-[13px] text-foreground">{chk.migrations}</span>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1.5">Tests</p>
                  <span className={clsx('font-mono text-[13px]', chk.testsPassed === chk.testsRun ? 'text-emerald-400' : 'text-amber-400')}>
                    {chk.testsPassed} / {chk.testsRun}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium font-mono', s.bg, s.color)}>
                  <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
                  {s.label}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground min-w-[80px] text-right">{chk.time}</span>
                <Link to="/recovery/report" className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
