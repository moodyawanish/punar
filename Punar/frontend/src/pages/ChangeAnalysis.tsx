import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, GitCompare, Database, FileCode, Package,
  AlertTriangle, ChevronRight, Plus, Minus, RefreshCw,
  FlaskConical,
} from 'lucide-react';

const DB_CHANGES = [
  { op: '+', column: 'users.phone_verified',       type: 'BOOLEAN NULL',                   safe: true  },
  { op: '-', column: 'orders.legacy_status',        type: 'VARCHAR(50)',                     safe: false },
  { op: '~', column: 'payment_status (enum)',       type: '+ REFUNDED_PENDING',              safe: false },
];

const APP_CHANGES = [
  { file: 'src/orders/model.ts',            additions: 12, deletions: 3 },
  { file: 'src/payments/processor.ts',      additions: 8,  deletions: 2 },
  { file: 'src/orders/order-service.ts',    additions: 5,  deletions: 0 },
  { file: 'src/api/payment-routes.ts',      additions: 4,  deletions: 1 },
];

const MIGRATIONS = [
  { file: '017_add_phone_verified.sql',      risk: 'safe',    desc: 'ADD COLUMN users.phone_verified' },
  { file: '018_drop_legacy_status.sql',      risk: 'unsafe',  desc: 'DROP COLUMN orders.legacy_status' },
  { file: '019_payment_status.sql',          risk: 'unsafe',  desc: 'ALTER TYPE payment_status ADD VALUE REFUNDED_PENDING' },
];

const DEP_CHANGES = [
  { name: 'pg',          from: '^8.10.0',  to: '^8.11.3', type: 'patch' },
  { name: 'decimal.js',  from: '^10.3.1',  to: '^10.4.3', type: 'minor' },
];

const RISK_COLOR: Record<string, string> = {
  safe:    'text-emerald-400',
  unsafe:  'text-red-400',
  warning: 'text-amber-400',
};

const RISK_BG: Record<string, string> = {
  safe:    'bg-emerald-400/10 border-emerald-400/20',
  unsafe:  'bg-red-400/10 border-red-400/20',
  warning: 'bg-amber-400/10 border-amber-400/20',
};

export function ChangeAnalysis() {
  const { id = 'payment-service' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-full">
      <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to={`/projects/${id}`} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={15} />
          </Link>
          <div className="w-px h-4 bg-border" />
          <span className="text-[15px] font-semibold">Change Analysis</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary border border-border text-muted-foreground">
            {id}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[12px] font-medium">
            <AlertTriangle size={12} />
            2 potentially breaking changes
          </div>
        </div>
      </header>

      <div className="px-8 py-8 max-w-[1060px] space-y-6">

        {/* Version comparison header */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-foreground mb-1">{id}</h2>
              <p className="text-[12px] text-muted-foreground">
                Analyzing rollback compatibility between V1 and V2
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-[11px] text-muted-foreground mb-1">Current (V1)</p>
                <span className="font-mono text-[18px] font-bold text-foreground">v2.3.0</span>
              </div>
              <GitCompare size={20} className="text-muted-foreground/40" />
              <div className="text-center">
                <p className="text-[11px] text-muted-foreground mb-1">Incoming (V2)</p>
                <span className="font-mono text-[18px] font-bold text-amber-400">v2.4.0</span>
              </div>
            </div>
          </div>

          {/* Summary counts */}
          <div className="mt-5 grid grid-cols-3 gap-4 pt-5 border-t border-border">
            <div className="flex items-center gap-3">
              <FileCode size={15} className="text-muted-foreground/60 shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground">Application files</p>
                <p className="font-mono text-[15px] font-semibold text-foreground">17 changed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package size={15} className="text-muted-foreground/60 shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground">Dependencies</p>
                <p className="font-mono text-[15px] font-semibold text-foreground">2 changed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Database size={15} className="text-muted-foreground/60 shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground">DB migrations</p>
                <p className="font-mono text-[15px] font-semibold text-foreground">3 detected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Database changes */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-muted-foreground/60" />
              <h2 className="text-[14px] font-semibold">Database Changes</h2>
            </div>
            <span className="text-[11px] font-mono text-amber-400">2 potentially breaking</span>
          </div>
          <div className="p-5 space-y-2">
            {DB_CHANGES.map((change) => (
              <div
                key={change.column}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${change.safe ? 'bg-emerald-400/5 border-emerald-400/15' : 'bg-red-400/5 border-red-400/15'}`}
              >
                <span className={`shrink-0 w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold font-mono ${change.safe ? 'bg-emerald-400/20 text-emerald-400' : 'bg-red-400/20 text-red-400'}`}>
                  {change.op}
                </span>
                <span className="font-mono text-[13px] font-semibold text-foreground">{change.column}</span>
                <span className="font-mono text-[11px] text-muted-foreground/70">{change.type}</span>
                {!change.safe && (
                  <span className="ml-auto flex items-center gap-1 text-[11px] text-red-400">
                    <AlertTriangle size={10} /> Breaking
                  </span>
                )}
                {change.safe && (
                  <span className="ml-auto text-[11px] text-emerald-400">Safe (additive)</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Migrations detected */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Database size={14} className="text-muted-foreground/60" />
            <h2 className="text-[14px] font-semibold">Migration Files Detected</h2>
          </div>
          <div className="divide-y divide-border">
            {MIGRATIONS.map((m) => (
              <div key={m.file} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${RISK_BG[m.risk]} ${RISK_COLOR[m.risk]}`}>
                    {m.risk}
                  </span>
                  <span className="font-mono text-[13px] text-foreground">{m.file}</span>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground/60">{m.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Application files changed */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <FileCode size={14} className="text-muted-foreground/60" />
            <h2 className="text-[14px] font-semibold">Application Changes (partial)</h2>
            <span className="ml-auto text-[11px] text-muted-foreground">17 files total</span>
          </div>
          <div className="divide-y divide-border">
            {APP_CHANGES.map((f) => (
              <div key={f.file} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.015] transition-colors">
                <span className="font-mono text-[12px] text-foreground/80">{f.file}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                    <Plus size={10} />{f.additions}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-red-400">
                    <Minus size={10} />{f.deletions}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dependency changes */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Package size={14} className="text-muted-foreground/60" />
            <h2 className="text-[14px] font-semibold">Dependency Changes</h2>
          </div>
          <div className="divide-y divide-border">
            {DEP_CHANGES.map((d) => (
              <div key={d.name} className="flex items-center justify-between px-5 py-3.5">
                <span className="font-mono text-[13px] text-foreground">{d.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[12px] text-muted-foreground">{d.from}</span>
                  <RefreshCw size={11} className="text-muted-foreground/40" />
                  <span className="font-mono text-[12px] text-foreground">{d.to}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${d.type === 'minor' ? 'bg-amber-400/10 text-amber-400' : 'bg-secondary border border-border text-muted-foreground'}`}>
                    {d.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            to={`/projects/${id}`}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Project
          </Link>
          <button
            onClick={() => navigate(`/projects/${id}/rollback-check`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors"
          >
            <FlaskConical size={14} />
            Start Rollback Rehearsal
          </button>
        </div>

      </div>
    </div>
  );
}
