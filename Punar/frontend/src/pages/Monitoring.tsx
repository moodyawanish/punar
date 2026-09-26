import { useNavigate, useParams } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import {
  AlertTriangle, ChevronRight,
  Database, Shield, FileCode, FileText,
} from 'lucide-react';
import { clsx } from 'clsx';

const COMPATIBILITY_ISSUES = [
  {
    severity: 'critical',
    migration: '019_payment_status.sql',
    component: 'Order processing',
    file: 'src/orders/model.ts',
    failedTest: 'rollback-order-compatibility',
    title: 'Persisted enum value unrecognized by V1',
    detail: 'V2 introduces REFUNDED_PENDING. V1 only supports PENDING, PAID, FAILED.',
    impact: 'V1 will throw on any order with status REFUNDED_PENDING.',
  },
  {
    severity: 'critical',
    migration: '018_drop_legacy_status.sql',
    component: 'Order model',
    file: 'src/orders/order-service.ts',
    failedTest: 'rollback-schema-compatibility',
    title: 'Dropped column still referenced by V1',
    detail: 'V2 drops orders.legacy_status. V1 still queries this column.',
    impact: 'V1 SELECT queries on orders will fail with "column does not exist".',
  },
  {
    severity: 'warning',
    migration: '017_add_phone_verified.sql',
    component: 'User registration',
    file: 'src/users/user-service.ts',
    failedTest: null,
    title: 'Additive migration — backward compatible',
    detail: 'users.phone_verified is nullable and additive. V1 will ignore it.',
    impact: 'No impact on V1.',
  },
];

const SEV_COLOR: Record<string, string> = {
  critical: 'text-red-400',
  warning:  'text-amber-400',
};
const SEV_BG: Record<string, string> = {
  critical: 'bg-red-400/5 border-red-400/20',
  warning:  'bg-amber-400/5 border-amber-400/20',
};

export function Monitoring() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const project = id ?? 'payment-service';

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-[15px] font-semibold">Rollback Compatibility Analysis</h1>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary border border-border text-muted-foreground">
            {project}
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">
            v2.3.0 → v2.4.0
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status="critical" label="UNSAFE" />
        </div>
      </header>

      <div className="px-8 py-6 max-w-[1260px] space-y-5">

        {/* Rollback status banner */}
        <div className="bg-red-400/5 border border-red-400/25 rounded-lg px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className="text-red-400 shrink-0" />
            <div>
              <p className="text-[14px] font-semibold text-red-400">Rollback Status: UNSAFE</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                2 compatibility issues detected. V1 cannot safely run against the state left by V2.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/projects/${project}/report`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors shrink-0"
          >
            <FileText size={13} />
            View Readiness Report
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Compatibility Tests',  value: '16 / 18',  color: 'text-amber-400'   },
            { label: 'Critical Issues',      value: '2',        color: 'text-red-400'     },
            { label: 'Warnings',             value: '1',        color: 'text-amber-400'   },
            { label: 'Schema Changes',       value: '7',        color: 'text-foreground'  },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card border border-border rounded-lg px-5 py-4">
              <p className="text-[12px] text-muted-foreground mb-2">{label}</p>
              <p className={clsx('font-mono text-[28px] font-semibold leading-none', color)}>{value}</p>
            </div>
          ))}
        </div>

        {/* Compatibility issues */}
        <div className="space-y-3">
          <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Compatibility Issues</h2>
          {COMPATIBILITY_ISSUES.map((issue, i) => (
            <div key={i} className={clsx('bg-card border rounded-lg overflow-hidden', SEV_BG[issue.severity])}>
              <div className="px-5 py-4 flex items-start gap-4">
                <div className={clsx('w-2 h-2 rounded-full shrink-0 mt-1.5', issue.severity === 'critical' ? 'bg-red-400' : 'bg-amber-400')} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={clsx('text-[14px] font-semibold', SEV_COLOR[issue.severity])}>{issue.title}</p>
                      <p className="text-[12px] text-muted-foreground mt-1">{issue.detail}</p>
                    </div>
                    <span className={clsx('text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0', SEV_BG[issue.severity], SEV_COLOR[issue.severity])}>
                      {issue.severity}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">Migration</p>
                      <span className="font-mono text-[11px] text-foreground/80">{issue.migration}</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">Component</p>
                      <span className="font-mono text-[11px] text-foreground/80">{issue.component}</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">Affected File</p>
                      <span className="font-mono text-[11px] text-foreground/80 flex items-center gap-1">
                        <FileCode size={10} /> {issue.file}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">Failed Test</p>
                      <span className="font-mono text-[11px] text-foreground/80">
                        {issue.failedTest ?? <span className="text-emerald-400">—</span>}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/[0.05]">
                    <p className="text-[11px] text-muted-foreground">
                      <span className="text-muted-foreground/60">Impact: </span>{issue.impact}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* IBM Bob Analysis */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Shield size={14} className="text-primary" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold">IBM Bob Analysis</h2>
                <p className="text-[12px] text-muted-foreground">Evidence-based rollback compatibility reasoning</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-400/10 border border-red-400/20">
              <span className="text-[11px] text-muted-foreground">Rollback Risk</span>
              <span className="font-mono text-[13px] font-bold text-red-400">HIGH</span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Explanation */}
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Explanation</p>
              <div className="bg-secondary/50 border border-border rounded-lg p-4 space-y-2">
                <p className="text-[13px] text-foreground leading-relaxed">
                  V2 introduces the persisted enum value <span className="font-mono text-red-400">REFUNDED_PENDING</span> into the <span className="font-mono text-foreground">payment_status</span> column.
                </p>
                <p className="text-[13px] text-foreground leading-relaxed">
                  The rollback version <span className="font-mono text-foreground">v2.3.0</span> does not recognize this value. If V2 writes records using this state and the application is later rolled back, V1 will fail when reading or processing those records.
                </p>
                <p className="text-[13px] text-foreground leading-relaxed">
                  Additionally, <span className="font-mono text-foreground">orders.legacy_status</span> is dropped by V2 migration <span className="font-mono text-foreground">018_drop_legacy_status.sql</span>, but V1 still references this column directly in its query layer.
                </p>
              </div>
            </div>

            {/* Evidence */}
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Evidence</p>
              <div className="space-y-2">
                {[
                  { label: 'Migration',      value: 'migrations/019_payment_status.sql',  icon: <Database size={11} /> },
                  { label: 'Affected file',  value: 'src/orders/model.ts',               icon: <FileCode size={11} /> },
                  { label: 'Migration',      value: 'migrations/018_drop_legacy_status.sql', icon: <Database size={11} /> },
                  { label: 'Affected file',  value: 'src/orders/order-service.ts',       icon: <FileCode size={11} /> },
                  { label: 'Failed test',    value: 'rollback-order-compatibility',       icon: <AlertTriangle size={11} className="text-red-400" /> },
                ].map((ev, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-md bg-secondary/40 border border-border">
                    <span className="text-muted-foreground/60 shrink-0">{ev.icon}</span>
                    <span className="text-[11px] text-muted-foreground/60 w-20 shrink-0">{ev.label}</span>
                    <span className="font-mono text-[12px] text-foreground/80">{ev.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Fix */}
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Recommended Fix</p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-[13px] font-semibold text-foreground mb-2">Expand-contract migration strategy</p>
                <div className="space-y-1.5">
                  {[
                    '1. Preserve backward-compatible handling in V2 for PENDING, PAID, FAILED.',
                    '2. Introduce REFUNDED_PENDING without breaking V1 enum parsing.',
                    '3. Deploy V2 while maintaining V1 compatibility window.',
                    '4. Migrate data safely to the new format.',
                    '5. Remove legacy compatibility in a later release once rollback window closes.',
                  ].map((step) => (
                    <p key={step} className="text-[12px] text-muted-foreground">{step}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-secondary/20">
            <p className="text-[12px] text-muted-foreground">
              Analysis complete · Confidence: High
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/projects/${project}/report`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors"
              >
                <ChevronRight size={13} />
                View Full Report
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
