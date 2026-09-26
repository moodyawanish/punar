import { Link, useParams } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, CheckCircle2, AlertTriangle, Database, FileCode, Shield } from 'lucide-react';

const TIMELINE = [
  { time: '13:01:01', event: 'Repository analysis started',                status: 'info'    },
  { time: '13:01:05', event: 'Rehearsal environment created',              status: 'success' },
  { time: '13:01:08', event: 'Database snapshot created',                  status: 'success' },
  { time: '13:01:15', event: 'V2 migrations applied (3 files)',            status: 'success' },
  { time: '13:01:21', event: 'V2 started — healthy',                       status: 'success' },
  { time: '13:01:25', event: 'Representative V2 state generated',          status: 'info'    },
  { time: '13:01:28', event: 'Switched to V1 (v2.3.0)',                   status: 'info'    },
  { time: '13:01:35', event: 'Compatibility test failed — REFUNDED_PENDING', status: 'error' },
  { time: '13:01:36', event: 'IBM Bob analysis generated',                 status: 'warning' },
  { time: '13:01:40', event: 'Readiness report generated',                 status: 'success' },
];

const DOT: Record<string, string> = {
  info:    'bg-indigo-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error:   'bg-red-400',
};

export function RecoveryReport() {
  const { id } = useParams<{ id: string }>();
  const project = id ?? 'payment-service';

  return (
    <div className="min-h-full">
      <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to={`/projects/${project}/analysis`} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={15} />
          </Link>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold">Rollback Readiness Report</span>
            <span className="font-mono text-[12px] text-muted-foreground">{project}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-red-400/10 text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            UNSAFE
          </span>
          <Link to={`/projects/${project}`} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            Return to Project
          </Link>
        </div>
      </header>

      <div className="px-8 py-8 max-w-[1060px] space-y-6">

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Project',              value: project,    mono: true  },
            { label: 'Schema Changes',       value: '7',        mono: true  },
            { label: 'Breaking Changes',     value: '2',        mono: true  },
            { label: 'Compatibility Tests',  value: '16 / 18',  mono: true  },
          ].map(({ label, value, mono }) => (
            <div key={label} className="bg-card border border-border rounded-lg px-5 py-4">
              <p className="text-[11px] text-muted-foreground mb-1.5">{label}</p>
              <p className={`text-[18px] font-semibold text-foreground ${mono ? 'font-mono' : ''}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_360px] gap-5">

          {/* Left: details */}
          <div className="space-y-5">

            {/* Version summary */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-[14px] font-semibold">Release Details</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-5">
                {[
                  { label: 'Project',           value: project,     mono: true  },
                  { label: 'Database',          value: 'PostgreSQL', mono: false },
                  { label: 'V1 (Current)',       value: 'v2.3.0',    mono: true  },
                  { label: 'V2 (Incoming)',      value: 'v2.4.0',    mono: true, bad: true },
                  { label: 'Migrations',         value: '3 files',   mono: true  },
                  { label: 'Rollback Status',    value: 'UNSAFE',    mono: true, bad: true },
                ].map(({ label, value, mono, bad }) => (
                  <div key={label}>
                    <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
                    <p className={`text-[14px] font-semibold ${mono ? 'font-mono' : ''} ${bad ? 'text-red-400' : 'text-foreground'}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Failed compatibility checks */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-[14px] font-semibold">Failed Compatibility Checks</h2>
              </div>
              <div className="p-6 space-y-4">
                {[
                  {
                    test: 'rollback-order-compatibility',
                    migration: '019_payment_status.sql',
                    file: 'src/orders/model.ts',
                    reason: 'V1 cannot interpret REFUNDED_PENDING persisted by V2',
                  },
                  {
                    test: 'rollback-schema-compatibility',
                    migration: '018_drop_legacy_status.sql',
                    file: 'src/orders/order-service.ts',
                    reason: 'orders.legacy_status dropped by V2, still queried by V1',
                  },
                ].map((check) => (
                  <div key={check.test} className="bg-red-400/5 border border-red-400/15 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                      <p className="text-[13px] font-semibold text-red-400">{check.reason}</p>
                    </div>
                    <div className="space-y-1.5 ml-5">
                      <p className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
                        <Database size={10} /> {check.migration}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
                        <FileCode size={10} /> {check.file}
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 font-mono">Test: {check.test}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IBM Bob explanation */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <Shield size={14} className="text-primary" />
                <h2 className="text-[14px] font-semibold">IBM Bob Explanation</h2>
              </div>
              <div className="p-6 space-y-3">
                <p className="text-[13px] text-foreground leading-relaxed">
                  V2 introduces the persisted enum value <span className="font-mono text-red-400">REFUNDED_PENDING</span> into the <span className="font-mono text-foreground">payment_status</span> column.
                  The rollback version v2.3.0 does not recognize this value, causing runtime failures when V1 reads those records.
                </p>
                <p className="text-[13px] text-foreground leading-relaxed">
                  Additionally, <span className="font-mono text-foreground">orders.legacy_status</span> is permanently dropped by V2 migration <span className="font-mono text-foreground">018_drop_legacy_status.sql</span>,
                  while V1 still queries this column — causing SQL errors on any order-related operation after rollback.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[11px] text-muted-foreground">Confidence:</span>
                  <span className="text-[11px] font-semibold text-emerald-400">High</span>
                </div>
              </div>
            </div>

            {/* Recommended Fix */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-[14px] font-semibold">Recommended Fix</h2>
              </div>
              <div className="p-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                  <p className="text-[13px] font-semibold text-foreground mb-2">
                    Recommended strategy: Expand-contract migration
                  </p>
                  <div className="space-y-1.5">
                    {[
                      '1. Preserve backward-compatible handling of PENDING, PAID, FAILED in V2.',
                      '2. Introduce REFUNDED_PENDING without breaking V1 enum parsing.',
                      '3. Deploy V2 while maintaining compatibility window.',
                      '4. Migrate data safely to the new format.',
                      '5. Remove legacy compatibility in a later release.',
                    ].map((step) => (
                      <p key={step} className="text-[12px] text-muted-foreground">{step}</p>
                    ))}
                  </div>
                </div>
                <button className="flex items-center gap-1.5 text-[13px] text-primary hover:text-primary/80 font-medium transition-colors">
                  View Proposed Changes
                </button>
              </div>
            </div>
          </div>

          {/* Right: timeline */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-[14px] font-semibold">Rehearsal Timeline</h2>
            </div>
            <div className="p-5 relative">
              <div className="absolute left-[25px] top-6 bottom-6 w-px bg-border" />
              <div className="space-y-0">
                {TIMELINE.map((item, i) => (
                  <div key={i} className="flex gap-4 relative pb-4 last:pb-0">
                    <div className="w-[11px] h-[11px] rounded-full shrink-0 mt-1 relative z-10 border border-[#1A2236] flex items-center justify-center"
                      style={{ background: '#0D1117' }}>
                      <span className={`w-1.5 h-1.5 rounded-full ${DOT[item.status]}`} />
                    </div>
                    <div>
                      <p className="text-[11px] font-mono text-muted-foreground/60 leading-none">{item.time}</p>
                      <p className="text-[12px] text-foreground mt-0.5 leading-snug">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-3.5 border-t border-border flex items-center gap-2">
              <AlertTriangle size={13} className="text-red-400" />
              <span className="text-[12px] text-red-400 font-medium">Rollback UNSAFE — do not deploy without fixing</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
