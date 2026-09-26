import { Link, useParams } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import {
  Rocket, RotateCcw, Shield, Server, Database,
  Cpu, HardDrive, Archive, ChevronRight, Activity,
  GitCommit, Clock, ArrowLeft,
} from 'lucide-react';
import { clsx } from 'clsx';

const PROJECTS: Record<string, {
  name: string; version: string; env: string; status: 'healthy' | 'degraded';
  lastDeployed: string;
  metrics: { apiLatency: string; errorRate: string; cpu: string; memory: string };
  deployments: { version: string; label: string; status: 'healthy' | 'recovered' | 'pending'; time: string; commit: string; rpId: string | null }[];
  latestRP: { id: string; appVersion: string; dbSchema: string; created: string };
}> = {
  'payment-service': {
    name: 'payment-service', version: 'v2.3.0', env: 'Production', status: 'healthy',
    lastDeployed: '2 hours ago',
    metrics: { apiLatency: '124 ms', errorRate: '0.7%', cpu: '42%', memory: '61%' },
    deployments: [
      { version: 'v2.3.0', label: 'Current',  status: 'healthy',   time: '2 hours ago', commit: '10cb914', rpId: 'RP-20394' },
      { version: 'v2.2.5', label: 'Previous', status: 'recovered', time: '5 days ago',  commit: 'c8a3f71', rpId: 'RP-20281' },
      { version: 'v2.2.0', label: 'Archived', status: 'healthy',   time: '12 days ago', commit: '4e9b002', rpId: null },
    ],
    latestRP: { id: 'RP-20394', appVersion: 'v2.3.0', dbSchema: 'Schema v18', created: '2 hours ago' },
  },
  'authentication-api': {
    name: 'authentication-api', version: 'v5.1.2', env: 'Production', status: 'healthy',
    lastDeployed: '1 day ago',
    metrics: { apiLatency: '38 ms', errorRate: '0.2%', cpu: '28%', memory: '44%' },
    deployments: [
      { version: 'v5.1.2', label: 'Current',  status: 'healthy', time: '1 day ago',   commit: '93ca201', rpId: 'RP-20362' },
      { version: 'v5.1.1', label: 'Previous', status: 'healthy', time: '8 days ago',  commit: 'b72f380', rpId: 'RP-20310' },
    ],
    latestRP: { id: 'RP-20362', appVersion: 'v5.1.2', dbSchema: 'Schema v12', created: '1 day ago' },
  },
  'customer-dashboard': {
    name: 'customer-dashboard', version: 'v1.0.4', env: 'Production', status: 'healthy',
    lastDeployed: '3 days ago',
    metrics: { apiLatency: '88 ms', errorRate: '0.4%', cpu: '35%', memory: '52%' },
    deployments: [
      { version: 'v1.0.4', label: 'Current', status: 'healthy', time: '3 days ago', commit: 'f14c920', rpId: 'RP-20340' },
    ],
    latestRP: { id: 'RP-20340', appVersion: 'v1.0.4', dbSchema: 'Schema v6', created: '3 days ago' },
  },
  'inventory-service': {
    name: 'inventory-service', version: 'v3.4.1', env: 'Production', status: 'healthy',
    lastDeployed: '5 hours ago',
    metrics: { apiLatency: '62 ms', errorRate: '0.3%', cpu: '55%', memory: '70%' },
    deployments: [
      { version: 'v3.4.1', label: 'Current',  status: 'healthy',   time: '5 hours ago', commit: 'a92d440', rpId: 'RP-20388' },
      { version: 'v3.5.0', label: 'Previous', status: 'recovered', time: '6 days ago',  commit: 'd77b139', rpId: 'RP-20281' },
    ],
    latestRP: { id: 'RP-20388', appVersion: 'v3.4.1', dbSchema: 'Schema v22', created: '5 hours ago' },
  },
};

function MetricTile({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="bg-secondary/40 rounded-lg px-4 py-3 border border-border">
      <p className="text-[11px] text-muted-foreground font-medium mb-1.5">{label}</p>
      <p className="font-mono text-[22px] font-semibold text-foreground leading-none">
        {value}
        {unit && <span className="text-[13px] font-normal text-muted-foreground ml-1">{unit}</span>}
      </p>
    </div>
  );
}

export function ProjectOverview() {
  const { id = 'payment-service' } = useParams<{ id: string }>();
  const project = PROJECTS[id] ?? PROJECTS['payment-service'];

  return (
    <div className="min-h-full">
      {/* Top bar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={15} />
          </Link>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold">{project.name}</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary border border-border text-muted-foreground">
              {project.env}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">{project.version}</span>
            <StatusBadge status={project.status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[12px] text-primary/80 px-2.5 py-1.5 rounded-md border border-primary/20 bg-primary/5">
            <Shield size={12} />
            Punar Protected
          </span>
          <Link
            to={`/deployments/new?project=${id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
          >
            <Rocket size={13} />
            Deploy New Version
          </Link>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-[13px] text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-colors">
            <RotateCcw size={13} />
            Recover
          </button>
        </div>
      </header>

      <div className="px-8 py-8 max-w-[1260px] space-y-6">

        {/* Metrics */}
        <div>
          <h2 className="text-[13px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">Live Metrics</h2>
          <div className="grid grid-cols-6 gap-3">
            <div className="bg-secondary/40 rounded-lg px-4 py-3 border border-border">
              <p className="text-[11px] text-muted-foreground font-medium mb-1.5 flex items-center gap-1.5">
                <Server size={11} /> Application
              </p>
              <StatusBadge status="healthy" className="text-[13px]" />
            </div>
            <div className="bg-secondary/40 rounded-lg px-4 py-3 border border-border">
              <p className="text-[11px] text-muted-foreground font-medium mb-1.5 flex items-center gap-1.5">
                <Database size={11} /> Database
              </p>
              <StatusBadge status="healthy" className="text-[13px]" />
            </div>
            <MetricTile label="API Latency"  value={project.metrics.apiLatency} />
            <MetricTile label="Error Rate"   value={project.metrics.errorRate} />
            <MetricTile label="CPU"          value={project.metrics.cpu} />
            <MetricTile label="Memory"       value={project.metrics.memory} />
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-[1fr_300px] gap-5">

          {/* Deployment History */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-[14px] font-semibold">Deployment History</h2>
              <Link to="/deployments" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                View all <ChevronRight size={13} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {project.deployments.map((dep) => (
                <div key={dep.version} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.015] transition-colors">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[14px] font-semibold text-foreground">{dep.version}</span>
                        <span className={clsx(
                          'text-[10px] px-1.5 py-0.5 rounded font-medium font-mono',
                          dep.label === 'Current'  && 'bg-primary/10 text-primary',
                          dep.label === 'Previous' && 'bg-secondary border border-border text-muted-foreground',
                          dep.label === 'Archived' && 'bg-secondary border border-border text-muted-foreground/40',
                        )}>
                          {dep.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-mono text-[11px] text-muted-foreground/60 flex items-center gap-1">
                          <GitCommit size={10} /> {dep.commit}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground/60 flex items-center gap-1">
                          <Clock size={10} /> {dep.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={dep.status} />
                    {dep.rpId && (
                      <span className="flex items-center gap-1.5 text-[11px] font-mono text-indigo-400/70">
                        <Archive size={11} /> {dep.rpId}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Latest Recovery Point */}
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <Archive size={14} className="text-indigo-400" />
                <h2 className="text-[14px] font-semibold">Latest Recovery Point</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Recovery Point ID</p>
                  <span className="font-mono text-[15px] font-semibold text-indigo-400">{project.latestRP.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">Application</p>
                    <span className="font-mono text-[12px] text-foreground">{project.latestRP.appVersion}</span>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">Database</p>
                    <span className="font-mono text-[12px] text-foreground">{project.latestRP.dbSchema}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <StatusBadge status="protected" label="Verified" />
                  <span className="text-[11px] font-mono text-muted-foreground/60">{project.latestRP.created}</span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="text-[14px] font-semibold mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  to={`/deployments/new?project=${id}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-md border border-border hover:bg-white/[0.03] hover:border-primary/30 transition-colors group"
                >
                  <span className="flex items-center gap-2 text-[13px] font-medium">
                    <Rocket size={13} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    Deploy New Version
                  </span>
                  <ChevronRight size={13} className="text-muted-foreground/40" />
                </Link>
                <Link
                  to="/recovery-points"
                  className="flex items-center justify-between px-3 py-2.5 rounded-md border border-border hover:bg-white/[0.03] transition-colors group"
                >
                  <span className="flex items-center gap-2 text-[13px] font-medium">
                    <Archive size={13} className="text-muted-foreground" />
                    View Recovery Points
                  </span>
                  <ChevronRight size={13} className="text-muted-foreground/40" />
                </Link>
                <Link
                  to="/monitoring"
                  className="flex items-center justify-between px-3 py-2.5 rounded-md border border-border hover:bg-white/[0.03] transition-colors group"
                >
                  <span className="flex items-center gap-2 text-[13px] font-medium">
                    <Activity size={13} className="text-muted-foreground" />
                    View Monitoring
                  </span>
                  <ChevronRight size={13} className="text-muted-foreground/40" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
