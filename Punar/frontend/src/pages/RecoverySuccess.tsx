import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { CheckCircle2, Archive, Clock, ArrowRight, RotateCcw, Activity } from 'lucide-react';

const BEFORE = [
  { label: 'Version',    value: 'v2.4.0',  mono: true  },
  { label: 'Error Rate', value: '18.4%',   mono: true, bad: true },
  { label: 'API Latency',value: '1.8 sec', mono: true, bad: true },
  { label: 'Status',     value: 'Critical',mono: false, bad: true },
];

const AFTER = [
  { label: 'Version',    value: 'v2.3.0',  mono: true  },
  { label: 'Error Rate', value: '0.6%',    mono: true, good: true },
  { label: 'API Latency',value: '128 ms',  mono: true, good: true },
  { label: 'Status',     value: 'Healthy', mono: false, good: true },
];

export function RecoverySuccess() {
  return (
    <div className="min-h-full">
      <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span className="text-[15px] font-semibold">Production Recovered</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/recovery/report"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
          >
            View Recovery Report
            <ArrowRight size={13} />
          </Link>
          <Link
            to="/projects/payment-service"
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
          >
            Return to Project
          </Link>
        </div>
      </header>

      <div className="px-8 py-10 max-w-[900px] space-y-6">

        {/* Success state */}
        <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <h1 className="text-[24px] font-semibold text-foreground mb-2">Production Recovered</h1>
          <p className="text-[14px] text-muted-foreground">
            <span className="font-mono text-foreground">payment-service</span> has returned to its previous stable state.
          </p>
        </div>

        {/* Recovery metrics */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Recovered Version', value: 'v2.3.0',   Icon: RotateCcw  },
            { label: 'Database',          value: 'Schema v18',Icon: Archive    },
            { label: 'Recovery Point',    value: 'RP-20394',  Icon: Archive, accent: true },
            { label: 'Recovery Duration', value: '42 sec',    Icon: Clock      },
            { label: 'Health',            value: undefined,   Icon: Activity   },
          ].map(({ label, value, Icon, accent }) => (
            <div key={label} className="bg-card border border-border rounded-lg px-4 py-4">
              <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1.5">
                <Icon size={11} />
                {label}
              </p>
              {value ? (
                <span className={`font-mono text-[15px] font-semibold ${accent ? 'text-indigo-400' : 'text-foreground'}`}>
                  {value}
                </span>
              ) : (
                <StatusBadge status="healthy" className="text-[13px]" />
              )}
            </div>
          ))}
        </div>

        {/* Before / After comparison */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-[14px] font-semibold">Before &amp; After Recovery</h2>
          </div>
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="p-6">
              <p className="text-[11px] font-mono text-red-400/80 uppercase tracking-wider mb-4">Before Recovery</p>
              <div className="space-y-3">
                {BEFORE.map(({ label, value, mono, bad }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground">{label}</span>
                    <span className={`text-[13px] font-semibold ${mono ? 'font-mono' : ''} ${bad ? 'text-red-400' : 'text-foreground'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6">
              <p className="text-[11px] font-mono text-emerald-400/80 uppercase tracking-wider mb-4">After Recovery</p>
              <div className="space-y-3">
                {AFTER.map(({ label, value, mono, good }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground">{label}</span>
                    <span className={`text-[13px] font-semibold ${mono ? 'font-mono' : ''} ${good ? 'text-emerald-400' : 'text-foreground'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/recovery/report"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-md bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors"
          >
            View Recovery Report
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/projects/payment-service"
            className="px-5 py-2.5 rounded-md border border-border text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-colors"
          >
            Return to Project
          </Link>
        </div>

      </div>
    </div>
  );
}
