import { Link, useParams } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import {
  GitCompare, Shield, Database, ChevronRight,
  GitCommit, Clock, ArrowLeft, AlertTriangle,
  CheckCircle2, FlaskConical,
} from 'lucide-react';
import { clsx } from 'clsx';

const PROJECTS: Record<string, {
  name: string; version: string; env: string; status: 'healthy' | 'degraded';
  lastChecked: string;
  database: string;
  migrations: number;
  rollbackStatus: 'safe' | 'unsafe' | 'warning';
  checks: { fromVersion: string; toVersion: string; label: string; status: 'safe' | 'unsafe' | 'warning'; time: string; commit: string }[];
}> = {
  'payment-service': {
    name: 'payment-service', version: 'v2.3.0', env: 'Production', status: 'healthy',
    lastChecked: '15 min ago',
    database: 'PostgreSQL',
    migrations: 3,
    rollbackStatus: 'unsafe',
    checks: [
      { fromVersion: 'v2.3.0', toVersion: 'v2.4.0', label: 'Latest',   status: 'unsafe',  time: '15 min ago', commit: '84fa219' },
      { fromVersion: 'v2.2.5', toVersion: 'v2.3.0', label: 'Previous', status: 'safe',    time: '5 days ago', commit: 'c8a3f71' },
      { fromVersion: 'v2.2.0', toVersion: 'v2.2.5', label: 'Archived', status: 'warning', time: '12 days ago', commit: '4e9b002' },
    ],
  },
  'authentication-api': {
    name: 'authentication-api', version: 'v5.1.2', env: 'Production', status: 'healthy',
    lastChecked: '1 day ago',
    database: 'PostgreSQL',
    migrations: 1,
    rollbackStatus: 'safe',
    checks: [
      { fromVersion: 'v5.1.1', toVersion: 'v5.1.2', label: 'Latest',   status: 'safe', time: '1 day ago',  commit: '93ca201' },
      { fromVersion: 'v5.1.0', toVersion: 'v5.1.1', label: 'Previous', status: 'safe', time: '8 days ago', commit: 'b72f380' },
    ],
  },
  'customer-dashboard': {
    name: 'customer-dashboard', version: 'v1.0.4', env: 'Production', status: 'healthy',
    lastChecked: '3 days ago',
    database: 'PostgreSQL',
    migrations: 0,
    rollbackStatus: 'safe',
    checks: [
      { fromVersion: 'v1.0.3', toVersion: 'v1.0.4', label: 'Latest', status: 'safe', time: '3 days ago', commit: 'f14c920' },
    ],
  },
  'inventory-service': {
    name: 'inventory-service', version: 'v3.4.1', env: 'Production', status: 'healthy',
    lastChecked: '5 hours ago',
    database: 'PostgreSQL',
    migrations: 2,
    rollbackStatus: 'safe',
    checks: [
      { fromVersion: 'v3.4.0', toVersion: 'v3.4.1', label: 'Latest',   status: 'safe', time: '5 hours ago', commit: 'a92d440' },
      { fromVersion: 'v3.5.0', toVersion: 'v3.5.1', label: 'Previous', status: 'safe', time: '6 days ago',  commit: 'd77b139' },
    ],
  },
};

const STATUS_BADGE: Record<string, { label: string; color: string; dot: string }> = {
  safe:    { label: 'SAFE',    color: 'text-emerald-400', dot: 'bg-emerald-400' },
  unsafe:  { label: 'UNSAFE',  color: 'text-red-400',     dot: 'bg-red-400'     },
  warning: { label: 'WARNING', color: 'text-amber-400',   dot: 'bg-amber-400'   },
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
  const rb = STATUS_BADGE[project.rollbackStatus];

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
            to={`/projects/${id}/change-analysis`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
          >
            <GitCompare size={13} />
            Run Rollback Check
          </Link>
        </div>
      </header>

      <div className="px-8 py-8 max-w-[1260px] space-y-6">

        {/* Summary tiles */}
        <div>
          <h2 className="text-[13px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">Project Summary</h2>
          <div className="grid grid-cols-6 gap-3">
            <div className="bg-secondary/40 rounded-lg px-4 py-3 border border-border">
              <p className="text-[11px] text-muted-foreground font-medium mb-1.5 flex items-center gap-1.5">
                <Database size={11} /> Database
              </p>
              <span className="font-mono text-[13px] font-medium text-foreground">{project.database}</span>
            </div>
            <MetricTile label="Migrations Detected" value={String(project.migrations)} />
            <MetricTile label="Total Checks Run"    value={String(project.checks.length)} />
            <MetricTile label="V1 (Production)"     value={project.version} />
            <MetricTile label="V2 (Incoming)"       value="v2.4.0" />
            <div className="bg-secondary/40 rounded-lg px-4 py-3 border border-border">
              <p className="text-[11px] text-muted-foreground font-medium mb-1.5">Rollback Status</p>
              <span className={clsx('flex items-center gap-1.5 font-mono text-[13px] font-semibold', rb.color)}>
                <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', rb.dot)} />
                {rb.label}
              </span>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-[1fr_300px] gap-5">

          {/* Rollback Check History */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-[14px] font-semibold">Rollback Check History</h2>
              <Link to="/check-history" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                View all <ChevronRight size={13} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {project.checks.map((chk) => {
                const s = STATUS_BADGE[chk.status];
                return (
                  <div key={chk.fromVersion + chk.toVersion} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.015] transition-colors">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[13px] font-semibold text-muted-foreground">{chk.fromVersion}</span>
                          <span className="text-muted-foreground/30 text-[11px]">→</span>
                          <span className="font-mono text-[14px] font-semibold text-foreground">{chk.toVersion}</span>
                          <span className={clsx(
                            'text-[10px] px-1.5 py-0.5 rounded font-medium font-mono',
                            chk.label === 'Latest'   && 'bg-primary/10 text-primary',
                            chk.label === 'Previous' && 'bg-secondary border border-border text-muted-foreground',
                            chk.label === 'Archived' && 'bg-secondary border border-border text-muted-foreground/40',
                          )}>
                            {chk.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="font-mono text-[11px] text-muted-foreground/60 flex items-center gap-1">
                            <GitCommit size={10} /> {chk.commit}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground/60 flex items-center gap-1">
                            <Clock size={10} /> {chk.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={clsx('flex items-center gap-1.5 text-[12px] font-medium font-mono', s.color)}>
                        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
                        {s.label}
                      </span>
                      <Link
                        to={`/projects/${id}/report`}
                        className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
                      >
                        Report <ChevronRight size={11} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Latest rollback status */}
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={14} className={project.rollbackStatus === 'unsafe' ? 'text-red-400' : 'text-amber-400'} />
                <h2 className="text-[14px] font-semibold">Rollback Readiness</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Incoming Release</p>
                  <span className="font-mono text-[15px] font-semibold text-foreground">v2.4.0</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">Migration</p>
                    <span className="font-mono text-[12px] text-foreground">019_payment_status</span>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">Last Checked</p>
                    <span className="font-mono text-[12px] text-foreground">{project.lastChecked}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className={clsx('flex items-center gap-1.5 text-[13px] font-semibold font-mono', rb.color)}>
                    <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', rb.dot)} />
                    {rb.label}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground/60">{project.lastChecked}</span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="text-[14px] font-semibold mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  to={`/projects/${id}/change-analysis`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-md border border-border hover:bg-white/[0.03] hover:border-primary/30 transition-colors group"
                >
                  <span className="flex items-center gap-2 text-[13px] font-medium">
                    <GitCompare size={13} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    Run Rollback Check
                  </span>
                  <ChevronRight size={13} className="text-muted-foreground/40" />
                </Link>
                <Link
                  to={`/projects/${id}/rehearsal`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-md border border-border hover:bg-white/[0.03] transition-colors group"
                >
                  <span className="flex items-center gap-2 text-[13px] font-medium">
                    <FlaskConical size={13} className="text-muted-foreground" />
                    View Rehearsal
                  </span>
                  <ChevronRight size={13} className="text-muted-foreground/40" />
                </Link>
                <Link
                  to={`/projects/${id}/report`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-md border border-border hover:bg-white/[0.03] transition-colors group"
                >
                  <span className="flex items-center gap-2 text-[13px] font-medium">
                    <CheckCircle2 size={13} className="text-muted-foreground" />
                    View Readiness Report
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
