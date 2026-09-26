import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { RotateCcw, ChevronRight, Archive } from 'lucide-react';

const RECOVERIES = [
  {
    id: 'REC-1028', project: 'payment-service',
    fromVersion: 'v2.4.0', toVersion: 'v2.3.0',
    fromDb: 'v19', toDb: 'v18',
    rpId: 'RP-20394', duration: '42 sec',
    status: 'healthy' as const, time: '15 min ago',
  },
  {
    id: 'REC-1014', project: 'inventory-service',
    fromVersion: 'v3.5.0', toVersion: 'v3.4.1',
    fromDb: 'v23', toDb: 'v22',
    rpId: 'RP-20281', duration: '31 sec',
    status: 'healthy' as const, time: '5 days ago',
  },
  {
    id: 'REC-1007', project: 'payment-service',
    fromVersion: 'v2.2.5', toVersion: 'v2.2.0',
    fromDb: 'v18', toDb: 'v17',
    rpId: 'RP-20210', duration: '58 sec',
    status: 'healthy' as const, time: '3 weeks ago',
  },
];

export function RecoveryHistory() {
  return (
    <div className="min-h-full">
      <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h1 className="text-[15px] font-semibold">Recovery History</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Past recovery operations performed by Punar.</p>
        </div>
        <div className="flex items-center gap-3 font-mono text-[12px] text-muted-foreground">
          <span><span className="text-emerald-400 font-semibold">3</span> recoveries — 100% success rate</span>
        </div>
      </header>

      <div className="px-8 py-8 max-w-[1060px] space-y-3">
        {RECOVERIES.map((rec) => (
          <div
            key={rec.id}
            className="bg-card border border-border rounded-lg px-6 py-5 flex items-center justify-between hover:border-border/60 hover:bg-white/[0.008] transition-colors"
          >
            <div className="flex items-center gap-8">
              <div className="min-w-[80px]">
                <p className="text-[11px] text-muted-foreground mb-0.5">Recovery ID</p>
                <span className="font-mono text-[14px] font-semibold text-foreground">{rec.id}</span>
              </div>
              <div className="min-w-[140px]">
                <p className="text-[11px] text-muted-foreground mb-0.5">Project</p>
                <Link to={`/projects/${rec.project}`} className="font-mono text-[13px] text-foreground/80 hover:text-foreground hover:underline transition-colors">
                  {rec.project}
                </Link>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1.5">Version</p>
                <div className="flex items-center gap-2 font-mono text-[13px]">
                  <span className="text-red-400">{rec.fromVersion}</span>
                  <RotateCcw size={11} className="text-muted-foreground/40" />
                  <span className="text-emerald-400">{rec.toVersion}</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1.5">Database</p>
                <div className="flex items-center gap-2 font-mono text-[12px] text-muted-foreground">
                  <span>Schema {rec.fromDb}</span>
                  <span className="text-muted-foreground/30">→</span>
                  <span>Schema {rec.toDb}</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-0.5">Recovery Point</p>
                <span className="font-mono text-[12px] text-indigo-400 flex items-center gap-1">
                  <Archive size={11} /> {rec.rpId}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground mb-0.5">Duration</p>
                <span className="font-mono text-[13px] text-foreground">{rec.duration}</span>
              </div>
              <StatusBadge status={rec.status} label="Successful" />
              <span className="font-mono text-[11px] text-muted-foreground min-w-[80px] text-right">{rec.time}</span>
              <Link to="/recovery/report" className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
