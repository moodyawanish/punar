import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Database, Server, Settings2, FileCode,
  GitBranch, GitCommit, Shield, AlertTriangle, Archive,
  ChevronRight, Rocket,
} from 'lucide-react';
import { clsx } from 'clsx';

const PROTECTION_ITEMS = [
  { icon: Server,    label: 'Application state',         desc: 'Current running version snapshot' },
  { icon: Database,  label: 'Database snapshot',         desc: 'Full database backup with schema' },
  { icon: Settings2, label: 'Environment configuration', desc: 'All env vars and service configs' },
  { icon: FileCode,  label: 'Deployment metadata',       desc: 'Commit, build artifacts, manifests' },
  { icon: Archive,   label: 'Service state',             desc: 'Current service mesh configuration' },
];

export function DeploymentConfig() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const project = searchParams.get('project') ?? 'payment-service';

  return (
    <div className="min-h-full">
      <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            to={`/projects/${project}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} />
          </Link>
          <div className="w-px h-4 bg-border" />
          <span className="text-[15px] font-semibold">Deploy New Version</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary border border-border text-muted-foreground">
            {project}
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-[12px] text-primary/80 px-2.5 py-1.5 rounded-md border border-primary/20 bg-primary/5">
          <Shield size={12} />
          Recovery Point will be created before deployment
        </span>
      </header>

      <div className="px-8 py-8 max-w-[900px] space-y-6">

        {/* Deployment config */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-[14px] font-semibold">Deployment Configuration</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-x-10 gap-y-5">
            {[
              { label: 'Project',          value: project,       mono: true  },
              { label: 'Environment',      value: 'Production',  mono: false },
              { label: 'Git Branch',       icon: <GitBranch size={12} />,  value: 'main',      mono: true  },
              { label: 'Commit',           icon: <GitCommit size={12} />,  value: '84fa219',   mono: true  },
              { label: 'Current Version',  value: 'v2.3.0',      mono: true  },
              { label: 'Incoming Version', value: 'v2.4.0',      mono: true, highlight: true },
            ].map(({ label, value, icon, mono, highlight }) => (
              <div key={label}>
                <p className="text-[11px] text-muted-foreground font-medium mb-1">{label}</p>
                <div className="flex items-center gap-1.5">
                  {icon && <span className="text-muted-foreground/50">{icon}</span>}
                  <span className={clsx(
                    mono ? 'font-mono text-[14px]' : 'text-[14px]',
                    highlight ? 'text-primary font-semibold' : 'text-foreground font-medium'
                  )}>
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database change warning */}
        <div className="bg-amber-400/5 border border-amber-400/20 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle size={15} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-amber-400 mb-1">Database Change Detected</p>
              <p className="text-[13px] text-muted-foreground">
                This deployment includes a database schema migration.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="font-mono text-[12px] px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  Schema v18
                </span>
                <ChevronRight size={13} className="text-muted-foreground/40" />
                <span className="font-mono text-[12px] px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  Schema v19
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Punar Protection */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2.5">
            <Shield size={15} className="text-primary" />
            <div>
              <h2 className="text-[14px] font-semibold">Punar Protection</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Before deployment begins, Punar will capture the following recovery data.
              </p>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {PROTECTION_ITEMS.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                  <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{desc}</p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">Included</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-[12px] text-muted-foreground">Recovery Point ID will be assigned after capture</p>
                <p className="text-[11px] text-muted-foreground/50 font-mono mt-0.5">Estimated: 15–30 seconds</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            to={`/projects/${project}`}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={() => navigate('/deployments/recovery-point')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors"
          >
            <Rocket size={14} />
            Create Recovery Point &amp; Deploy
          </button>
        </div>

      </div>
    </div>
  );
}
