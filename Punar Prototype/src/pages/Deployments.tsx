import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { Rocket, Archive, GitCommit, Filter } from 'lucide-react';
import { clsx } from 'clsx';

const SUMMARY = [
  { label: 'Today',       value: '6' },
  { label: 'Successful',  value: '3', color: 'text-emerald-400' },
  { label: 'Failed',      value: '2', color: 'text-red-400'    },
  { label: 'Recovered',   value: '1', color: 'text-amber-400'  },
];

const DEPLOYMENTS = [
  {
    version: 'v2.4.0', project: 'payment-service',      commit: '84fa219',
    env: 'Production', status: 'recovered',  health: 'failed',    rpId: 'RP-20394', time: '15 min ago',
  },
  {
    version: 'v2.3.0', project: 'payment-service',      commit: '10cb914',
    env: 'Production', status: 'healthy',   health: 'healthy',   rpId: 'RP-20371', time: '2 days ago',
  },
  {
    version: 'v5.1.2', project: 'authentication-api',   commit: '93ca201',
    env: 'Production', status: 'healthy',   health: 'healthy',   rpId: 'RP-20362', time: 'Yesterday',
  },
  {
    version: 'v3.5.0', project: 'inventory-service',    commit: 'd77b139',
    env: 'Production', status: 'recovered', health: 'failed',    rpId: 'RP-20281', time: '6 days ago',
  },
  {
    version: 'v1.0.4', project: 'customer-dashboard',   commit: 'f14c920',
    env: 'Production', status: 'healthy',   health: 'healthy',   rpId: 'RP-20340', time: '3 days ago',
  },
  {
    version: 'v3.4.1', project: 'inventory-service',    commit: 'a92d440',
    env: 'Production', status: 'healthy',   health: 'healthy',   rpId: 'RP-20388', time: '5 hours ago',
  },
];

type DeployStatus = 'healthy' | 'recovered' | 'deploying' | 'degraded' | 'failed';

const STATUS_LABEL: Record<string, { label: string; status: DeployStatus }> = {
  healthy:   { label: 'Successful', status: 'healthy'   },
  recovered: { label: 'Recovered',  status: 'recovered' },
  deploying: { label: 'Deploying',  status: 'deploying' },
  degraded:  { label: 'Degraded',   status: 'degraded'  },
  failed:    { label: 'Failed',     status: 'failed'    },
};

export function Deployments() {
  return (
    <div className="min-h-full">
      <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h1 className="text-[15px] font-semibold">Deployments</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Track and manage application releases across Punar.</p>
        </div>
        <Link
          to="/deployments/new"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
        >
          <Rocket size={13} />
          New Deployment
        </Link>
      </header>

      <div className="px-8 py-8 max-w-[1260px] space-y-6">

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          {SUMMARY.map(({ label, value, color }) => (
            <div key={label} className="bg-card border border-border rounded-lg px-5 py-4">
              <p className="text-[12px] font-medium text-muted-foreground mb-2">{label}</p>
              <p className={clsx('font-mono text-[28px] font-semibold leading-none', color ?? 'text-foreground')}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h2 className="text-[14px] font-semibold">All Deployments</h2>
            <button className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-md border border-border">
              <Filter size={12} />
              Filter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  {['Version', 'Project', 'Commit', 'Environment', 'Status', 'Health', 'Recovery Point', 'Time'].map((col) => (
                    <th key={col} className="px-5 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {DEPLOYMENTS.map((dep, i) => {
                  const s = STATUS_LABEL[dep.status] ?? STATUS_LABEL.healthy;
                  const h = STATUS_LABEL[dep.health] ?? STATUS_LABEL.healthy;
                  return (
                    <tr key={i} className="hover:bg-white/[0.018] transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-semibold text-foreground">{dep.version}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          to={`/projects/${dep.project}`}
                          className="text-foreground/80 hover:text-foreground font-mono hover:underline transition-colors"
                        >
                          {dep.project}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-muted-foreground flex items-center gap-1.5">
                          <GitCommit size={11} className="shrink-0" />
                          {dep.commit}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-secondary border border-border text-muted-foreground">
                          {dep.env}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={s.status} label={s.label} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={h.status} label={h.label} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[12px] text-indigo-400/80 flex items-center gap-1.5">
                          <Archive size={11} />
                          {dep.rpId}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[11px] text-muted-foreground">{dep.time}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
