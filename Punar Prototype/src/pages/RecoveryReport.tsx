import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, Archive } from 'lucide-react';

const TIMELINE = [
  { time: '12:42:01', event: 'Recovery Point RP-20394 created', status: 'success' },
  { time: '12:42:05', event: 'Deployment v2.4.0 started',      status: 'info'    },
  { time: '12:42:18', event: 'Deployment v2.4.0 completed',    status: 'info'    },
  { time: '12:42:25', event: 'Health degradation detected',    status: 'error'   },
  { time: '12:42:30', event: 'Punar analysis completed',       status: 'warning' },
  { time: '12:44:02', event: 'Recovery initiated',             status: 'info'    },
  { time: '12:44:38', event: 'Production restored',            status: 'success' },
];

const DOT: Record<string, string> = {
  info:    'bg-indigo-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error:   'bg-red-400',
};

export function RecoveryReport() {
  return (
    <div className="min-h-full">
      <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/recovery/success" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={15} />
          </Link>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold">Recovery Report</span>
            <span className="font-mono text-[12px] text-muted-foreground">INC-2091</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status="healthy" label="Resolved" />
          <Link to="/projects/payment-service" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            Return to Project
          </Link>
        </div>
      </header>

      <div className="px-8 py-8 max-w-[1060px] space-y-6">

        {/* Incident summary */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Incident ID',         value: 'INC-2091',          mono: true },
            { label: 'Time to Detect',      value: '25 seconds',        mono: true },
            { label: 'Time to Recover',     value: '42 seconds',        mono: true },
            { label: 'Total Duration',      value: '2 min 37 sec',      mono: true },
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

            {/* Incident details */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-[14px] font-semibold">Incident Details</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-5">
                {[
                  { label: 'Project',           value: 'payment-service', mono: true  },
                  { label: 'Environment',       value: 'Production',      mono: false },
                  { label: 'Failed Version',    value: 'v2.4.0',          mono: true, bad: true  },
                  { label: 'Recovered Version', value: 'v2.3.0',          mono: true, good: true },
                  { label: 'Recovery Point',    value: 'RP-20394',        mono: true, accent: true },
                  { label: 'Status',            value: 'Resolved',        mono: false },
                ].map(({ label, value, mono, bad, good, accent }) => (
                  <div key={label}>
                    <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
                    <p className={`text-[14px] font-semibold ${mono ? 'font-mono' : ''} ${bad ? 'text-red-400' : good ? 'text-emerald-400' : accent ? 'text-indigo-400' : 'text-foreground'}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Root cause */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-[14px] font-semibold">Root Cause Analysis</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-amber-400/5 border border-amber-400/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[13px] text-foreground font-medium leading-snug">
                      Database schema incompatibility
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    'Schema v19 removed a column that the application actively queries',
                    'Application code was not updated to handle the schema change',
                    'No backwards-compatible migration path was provided',
                    'Database connection pool exhausted due to repeated failed queries',
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0 mt-[5px]" />
                      {point}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[11px] text-muted-foreground">Punar Confidence:</span>
                  <span className="text-[11px] font-semibold text-emerald-400">High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: timeline */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-[14px] font-semibold">Incident Timeline</h2>
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
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span className="text-[12px] text-emerald-400 font-medium">Incident resolved in 2 min 37 sec</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
