import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { Database, Eye, Trash2 } from 'lucide-react';

const SUMMARY = [
  { label: 'Available',    value: '12' },
  { label: 'Verified',     value: '12', color: 'text-emerald-400' },
  { label: 'Used',         value: '3',  color: 'text-indigo-400'  },
  { label: 'Storage',      value: '4.2 GB' },
];

const SNAPSHOTS = [
  { id: 'SNAP-394', project: 'payment-service',    app: 'v2.3.0', db: 'Schema v18', env: 'Rehearsal', created: '15 min ago',  status: 'healthy' as const },
  { id: 'SNAP-388', project: 'inventory-service',  app: 'v3.4.1', db: 'Schema v22', env: 'Rehearsal', created: '5 hours ago', status: 'healthy' as const },
  { id: 'SNAP-371', project: 'payment-service',    app: 'v2.2.5', db: 'Schema v18', env: 'Rehearsal', created: '2 days ago',  status: 'healthy' as const },
  { id: 'SNAP-362', project: 'authentication-api', app: 'v5.1.2', db: 'Schema v12', env: 'Rehearsal', created: 'Yesterday',   status: 'healthy' as const },
  { id: 'SNAP-340', project: 'customer-dashboard', app: 'v1.0.4', db: 'Schema v6',  env: 'Rehearsal', created: '3 days ago',  status: 'healthy' as const },
  { id: 'SNAP-281', project: 'inventory-service',  app: 'v3.4.1', db: 'Schema v22', env: 'Rehearsal', created: '6 days ago',  status: 'recovered' as const },
];

export function RecoveryPoints() {
  return (
    <div className="min-h-full">
      <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h1 className="text-[15px] font-semibold">Snapshots</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Production-like database snapshots used by rollback rehearsals.
          </p>
        </div>
      </header>

      <div className="px-8 py-8 max-w-[1260px] space-y-6">

        <div className="grid grid-cols-4 gap-4">
          {SUMMARY.map(({ label, value, color }) => (
            <div key={label} className="bg-card border border-border rounded-lg px-5 py-4">
              <p className="text-[12px] text-muted-foreground mb-2">{label}</p>
              <p className={`font-mono text-[28px] font-semibold leading-none ${color ?? 'text-foreground'}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
            <Database size={14} className="text-muted-foreground/60" />
            <h2 className="text-[14px] font-semibold">All Snapshots</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  {['Snapshot', 'Project', 'Application', 'Database', 'Environment', 'Created', 'Status', 'Actions'].map((col) => (
                    <th key={col} className="px-5 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SNAPSHOTS.map((snap) => (
                  <tr key={snap.id} className="hover:bg-white/[0.018] transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-semibold text-indigo-400">{snap.id}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link to={`/projects/${snap.project}`} className="font-mono text-foreground/80 hover:text-foreground hover:underline transition-colors">
                        {snap.project}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-foreground/80">{snap.app}</td>
                    <td className="px-5 py-3.5 font-mono text-foreground/80">{snap.db}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-secondary border border-border text-muted-foreground">{snap.env}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground">{snap.created}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={snap.status} label={snap.status === 'recovered' ? 'Used' : 'Verified'} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button className="text-muted-foreground/50 hover:text-foreground transition-colors p-1">
                          <Eye size={13} />
                        </button>
                        <button className="text-muted-foreground/50 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
