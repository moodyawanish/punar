import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import {
  AlertTriangle, RotateCcw, ChevronDown, X,
  Database, Zap, Server, Cpu, Activity,
  TrendingUp, Shield, Archive,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { clsx } from 'clsx';

// Chart datasets: time = minutes relative to deployment (0 = deploy)
function buildChartData(
  baselineValues: number[],
  currentValues: number[]
): { t: string; baseline: number | null; current: number | null }[] {
  const pts: { t: string; baseline: number | null; current: number | null }[] = [];
  baselineValues.forEach((v, i) => pts.push({ t: `-${(baselineValues.length - i) * 2}m`, baseline: v, current: null }));
  pts.push({ t: '0', baseline: baselineValues.at(-1) ?? null, current: currentValues[0] });
  currentValues.slice(1).forEach((v, i) => pts.push({ t: `+${(i + 1) * 2}m`, baseline: null, current: v }));
  return pts;
}

const LATENCY_DATA = buildChartData(
  [120, 124, 118, 126, 122, 124],
  [124, 310, 680, 1200, 1800, 1800]
);
const ERROR_DATA = buildChartData(
  [0.6, 0.7, 0.8, 0.7, 0.6, 0.7],
  [0.7, 4.2, 9.8, 14.6, 18.4, 18.4]
);
const CPU_DATA = buildChartData(
  [40, 42, 41, 43, 42, 42],
  [42, 55, 70, 80, 83, 83]
);

const DETECTED_ISSUES = [
  'Database query latency increased 12× after migration',
  'HTTP 500 error rate spiked from 0.7% to 18.4%',
  'payment-service health checks are failing',
  'API routes are returning database connection errors',
];

function MiniTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141924] border border-border rounded px-2.5 py-1.5 text-[11px] shadow-xl">
      <p className="font-mono text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => p.value != null && (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.stroke }} />
          <span className="font-mono text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function MetricChart({
  title, data, unit, baseline, current, color = '#EF4444',
}: {
  title: string; data: any[]; unit: string;
  baseline: string; current: string; color?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[12px] font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-[22px] font-semibold text-red-400">{current}</span>
            <span className="text-[11px] text-muted-foreground font-mono">↑ from {baseline}</span>
          </div>
        </div>
        <TrendingUp size={14} className="text-red-400 mt-1" />
      </div>
      <div className="h-[90px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 2, right: 2, left: -32, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A2236" vertical={false} />
            <XAxis dataKey="t" stroke="#8892A4" fontSize={9} tickLine={false} axisLine={false} fontFamily="JetBrains Mono, monospace" />
            <YAxis stroke="#8892A4" fontSize={9} tickLine={false} axisLine={false} fontFamily="JetBrains Mono, monospace" />
            <Tooltip content={<MiniTooltip />} cursor={{ stroke: '#1A2236' }} />
            <ReferenceLine x="0" stroke="#6366F1" strokeDasharray="4 4" strokeWidth={1} />
            <Line
              dataKey="baseline"
              stroke="#22C55E"
              strokeWidth={1.5}
              dot={false}
              connectNulls={false}
              name="Baseline"
            />
            <Line
              dataKey="current"
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              connectNulls={false}
              name="Current"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RecoveryModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl p-8 w-[520px] shadow-2xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-[18px] font-semibold">Recover Production?</h2>
            <p className="text-[13px] text-muted-foreground mt-1">
              Punar will restore the previous stable state of payment-service.
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* State comparison */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-400/5 border border-red-400/20 rounded-lg p-4">
            <p className="text-[11px] font-mono text-red-400/80 uppercase tracking-wider mb-3">Current (Degraded)</p>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-muted-foreground">Version</p>
                <span className="font-mono text-[14px] font-semibold text-foreground">v2.4.0</span>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Database</p>
                <span className="font-mono text-[13px] text-foreground">Schema v19</span>
              </div>
              <StatusBadge status="degraded" />
            </div>
          </div>
          <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-lg p-4">
            <p className="text-[11px] font-mono text-emerald-400/80 uppercase tracking-wider mb-3">Restore To (Stable)</p>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-muted-foreground">Version</p>
                <span className="font-mono text-[14px] font-semibold text-foreground">v2.3.0</span>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Database</p>
                <span className="font-mono text-[13px] text-foreground">Schema v18</span>
              </div>
              <StatusBadge status="healthy" />
            </div>
          </div>
        </div>

        {/* Recovery point */}
        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-secondary border border-border mb-6">
          <Archive size={14} className="text-indigo-400 shrink-0" />
          <div>
            <p className="text-[12px] font-medium text-foreground">Recovery Point: <span className="font-mono text-indigo-400">RP-20394</span></p>
            <p className="text-[11px] text-muted-foreground">Created 15 min ago · Verified · Includes database snapshot</p>
          </div>
        </div>

        {/* What Punar will restore */}
        <div className="mb-6">
          <p className="text-[11px] font-medium text-muted-foreground mb-2">Punar will restore:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {['Application version v2.3.0', 'Database Schema v18', 'Environment configuration', 'Service configuration'].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-md border border-border text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-md bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={13} />
            Start Recovery
          </button>
        </div>
      </div>
    </div>
  );
}

export function Monitoring() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleConfirmRecovery = () => {
    setShowModal(false);
    navigate('/recovery/progress');
  };

  return (
    <>
      {showModal && (
        <RecoveryModal
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmRecovery}
        />
      )}

      <div className="min-h-full">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-semibold">Monitoring</h1>
            <div className="flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-md bg-secondary border border-border text-muted-foreground">
              <span className="font-mono">payment-service</span>
              <ChevronDown size={11} />
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary border border-border text-muted-foreground">
              Production
            </span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status="degraded" />
          </div>
        </header>

        <div className="px-8 py-6 max-w-[1260px] space-y-5">

          {/* Degradation alert banner */}
          <div className="bg-red-400/5 border border-red-400/25 rounded-lg px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} className="text-red-400 shrink-0" />
              <div>
                <p className="text-[14px] font-semibold text-red-400">Deployment Degradation Detected</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Deployment <span className="font-mono text-foreground">v2.4.0</span> is causing production health degradation.
                  Severity: <span className="text-red-400 font-medium">Critical</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors shrink-0"
            >
              <RotateCcw size={13} />
              Recover with Punar
            </button>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-red-400/20 rounded-lg px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Zap size={12} /> API Response Time
                </p>
                <TrendingUp size={12} className="text-red-400" />
              </div>
              <p className="font-mono text-[28px] font-semibold text-red-400">1.8 sec</p>
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">Baseline: 124 ms</p>
            </div>
            <div className="bg-card border border-red-400/20 rounded-lg px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Activity size={12} /> Error Rate
                </p>
                <TrendingUp size={12} className="text-red-400" />
              </div>
              <p className="font-mono text-[28px] font-semibold text-red-400">18.4%</p>
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">Baseline: 0.7%</p>
            </div>
            <div className="bg-card border border-amber-400/20 rounded-lg px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Server size={12} /> HTTP 5xx Errors
                </p>
                <TrendingUp size={12} className="text-amber-400" />
              </div>
              <p className="font-mono text-[28px] font-semibold text-amber-400">137</p>
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">In last 5 min</p>
            </div>
            <div className="bg-card border border-red-400/20 rounded-lg px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Database size={12} /> DB Query Latency
                </p>
                <TrendingUp size={12} className="text-red-400" />
              </div>
              <p className="font-mono text-[28px] font-semibold text-red-400">982 ms</p>
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">Baseline: 8 ms</p>
            </div>
            <div className="bg-card border border-amber-400/20 rounded-lg px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Cpu size={12} /> CPU
                </p>
                <TrendingUp size={12} className="text-amber-400" />
              </div>
              <p className="font-mono text-[28px] font-semibold text-amber-400">83%</p>
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">Baseline: 42%</p>
            </div>
            <div className="bg-card border border-amber-400/20 rounded-lg px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Database size={12} /> DB Connections
                </p>
                <TrendingUp size={12} className="text-amber-400" />
              </div>
              <p className="font-mono text-[28px] font-semibold text-amber-400">94%</p>
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">Pool utilization</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-3 gap-4">
            <MetricChart
              title="API Latency (ms)"
              data={LATENCY_DATA}
              unit="ms"
              baseline="124 ms"
              current="1,800 ms"
            />
            <MetricChart
              title="Error Rate (%)"
              data={ERROR_DATA}
              unit="%"
              baseline="0.7%"
              current="18.4%"
            />
            <MetricChart
              title="CPU Usage (%)"
              data={CPU_DATA}
              unit="%"
              baseline="42%"
              current="83%"
              color="#F59E0B"
            />
          </div>

          {/* Punar Analysis */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Shield size={14} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold">Punar Analysis</h2>
                  <p className="text-[12px] text-muted-foreground">Automated root-cause analysis of deployment degradation</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-400/10 border border-red-400/20">
                <span className="text-[11px] text-muted-foreground">Deployment Risk</span>
                <span className="font-mono text-[13px] font-bold text-red-400">HIGH</span>
              </div>
            </div>

            <div className="p-6 grid grid-cols-[1fr_1fr_1fr] gap-6">

              {/* What changed */}
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">What Changed</p>
                <div className="space-y-3">
                  <div className="bg-secondary/50 border border-border rounded-lg p-3.5">
                    <p className="text-[11px] text-muted-foreground mb-1">Application</p>
                    <div className="flex items-center gap-2 font-mono text-[13px]">
                      <span className="text-foreground">v2.3.0</span>
                      <span className="text-muted-foreground/40">→</span>
                      <span className="text-amber-400 font-semibold">v2.4.0</span>
                    </div>
                  </div>
                  <div className="bg-secondary/50 border border-border rounded-lg p-3.5">
                    <p className="text-[11px] text-muted-foreground mb-1">Database Schema</p>
                    <div className="flex items-center gap-2 font-mono text-[13px]">
                      <span className="text-foreground">v18</span>
                      <span className="text-muted-foreground/40">→</span>
                      <span className="text-amber-400 font-semibold">v19</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detected issues */}
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Detected Issues</p>
                <div className="space-y-2">
                  {DETECTED_ISSUES.map((issue) => (
                    <div key={issue} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                      <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />
                      {issue}
                    </div>
                  ))}
                </div>
              </div>

              {/* Root cause + recommendation */}
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Probable Cause</p>
                  <div className="bg-red-400/5 border border-red-400/15 rounded-lg p-3.5">
                    <p className="text-[13px] font-semibold text-foreground leading-snug">
                      Database schema incompatibility introduced by migration v19
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] text-muted-foreground">Confidence</span>
                      <span className="text-[11px] font-semibold text-emerald-400">High</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Recommended Recovery</p>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <Archive size={12} className="text-indigo-400" />
                      <span className="font-mono text-[14px] font-bold text-primary">RP-20394</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground">Application: <span className="font-mono text-foreground">v2.3.0</span></p>
                      <p className="text-[11px] text-muted-foreground">Database: <span className="font-mono text-foreground">Schema v18</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-secondary/20">
              <p className="text-[12px] text-muted-foreground">
                Analysis completed · Recovery window open · Every second matters
              </p>
              <div className="flex items-center gap-3">
                <button className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                  View Detailed Analysis
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors"
                >
                  <RotateCcw size={13} />
                  Recover with Punar
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
