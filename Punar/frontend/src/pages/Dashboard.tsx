import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import {
  FolderGit2,
  GitCompare,
  CheckCircle2,
  Shield,
  Bell,
  Search,
  ArrowUpRight,
  AlertTriangle,
  FlaskConical,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { clsx } from 'clsx';

const checkData = [
  { day: 'Mon', safe: 3, warning: 1, unsafe: 0 },
  { day: 'Tue', safe: 4, warning: 0, unsafe: 1 },
  { day: 'Wed', safe: 2, warning: 1, unsafe: 0 },
  { day: 'Thu', safe: 5, warning: 0, unsafe: 0 },
  { day: 'Fri', safe: 2, warning: 1, unsafe: 2 },
  { day: 'Sat', safe: 1, warning: 0, unsafe: 0 },
  { day: 'Sun', safe: 3, warning: 0, unsafe: 0 },
];

const RECENT_CHECKS = [
  {
    type: 'unsafe',
    time: '15 min ago',
    title: 'Rollback compatibility issue detected',
    service: 'payment-service',
    detail: 'v2.3.0 → v2.4.0 · UNSAFE',
    status: 'error',
  },
  {
    type: 'safe',
    time: '2 hours ago',
    title: 'Rollback rehearsal passed',
    service: 'authentication-api',
    detail: 'v5.1.1 → v5.1.2 · SAFE',
    status: 'success',
  },
  {
    type: 'check',
    time: 'Yesterday',
    title: 'IBM Bob analysis generated',
    service: 'payment-service',
    detail: '3 compatibility issues found',
    status: 'warning',
  },
  {
    type: 'safe',
    time: 'Yesterday',
    title: 'Rollback rehearsal passed',
    service: 'inventory-service',
    detail: 'v3.4.0 → v3.4.1 · SAFE',
    status: 'success',
  },
  {
    type: 'check',
    time: '2 days ago',
    title: 'Readiness report generated',
    service: 'customer-dashboard',
    detail: 'v1.0.3 → v1.0.4 · SAFE',
    status: 'success',
  },
];

const ACTIVITY_DOT: Record<string, string> = {
  success: 'bg-emerald-400',
  info:    'bg-indigo-400',
  warning: 'bg-amber-400',
  error:   'bg-red-400',
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141924] border border-border rounded-lg px-3 py-2.5 text-[12px] shadow-xl">
      <p className="font-mono text-muted-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1 last:mb-0">
          <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: p.fill }} />
          <span className="text-foreground/70">{p.name}</span>
          <span className="font-mono text-foreground ml-auto pl-4">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="min-h-full">
      {/* Top bar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h1 className="text-[15px] font-semibold text-foreground">Good morning, Developer</h1>
          <p className="text-[12px] text-muted-foreground leading-none mt-0.5">
            Your projects are monitored for rollback compatibility by Punar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary border border-border text-muted-foreground text-[13px] w-48">
            <Search size={13} className="shrink-0" />
            <span>Search...</span>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/[0.04] text-muted-foreground transition-colors relative">
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
          </button>
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-[11px] font-semibold text-primary">D</span>
          </div>
          <Link
            to="/projects/payment-service/change-analysis"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
          >
            <GitCompare size={13} />
            Run Rollback Check
          </Link>
        </div>
      </header>

      {/* Page content */}
      <div className="px-8 py-8 max-w-[1260px] space-y-6">

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            icon={<FolderGit2 size={15} />}
            label="Projects Protected"
            value="4"
            context="All monitored"
            contextColor="text-emerald-400"
          />
          <MetricCard
            icon={<GitCompare size={15} />}
            label="Rollback Checks"
            value="20"
            context="Last 7 days"
          />
          <MetricCard
            icon={<AlertTriangle size={15} />}
            label="Unsafe Releases Found"
            value="3"
            context="Last 7 days"
            contextColor="text-red-400"
          />
          <MetricCard
            icon={<CheckCircle2 size={15} />}
            label="Safe to Deploy"
            value="17"
            context="Last 7 days"
            contextColor="text-emerald-400"
          />
        </div>

        {/* Rollback Safety Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-muted-foreground" />
                <span className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                  Rollback Safety Coverage
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground/60 ml-5">
                Pre-deployment rollback compatibility status across projects.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[13px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-emerald-400">All Projects Monitored</span>
            </div>
          </div>

          <div className="mt-5 flex items-end gap-8">
            <div>
              <span className="font-mono text-[36px] font-semibold leading-none text-foreground">4</span>
              <span className="font-mono text-[24px] font-normal text-muted-foreground/40 mx-1">/</span>
              <span className="font-mono text-[24px] font-semibold text-muted-foreground/60">4</span>
              <p className="text-[12px] text-muted-foreground mt-1">Protected Projects</p>
            </div>
            <div className="flex-1 pb-0.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-muted-foreground font-mono">coverage</span>
                <span className="text-[11px] font-mono text-emerald-400">100%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full w-full bg-emerald-400 rounded-full" />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {['payment-service', 'authentication-api', 'customer-dashboard', 'inventory-service'].map((svc) => (
                  <div key={svc} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-[11px] font-mono text-muted-foreground truncate">{svc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart + Latest Check */}
        <div className="grid grid-cols-[1fr_340px] gap-4">

          {/* Rollback Check Activity Chart */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-[14px] font-semibold text-foreground">Rollback Check Activity</h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">Last 7 days</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                <LegendDot color="bg-emerald-500" label="Safe" />
                <LegendDot color="bg-amber-500"   label="Warning" />
                <LegendDot color="bg-red-500"     label="Unsafe" />
              </div>
            </div>
            <div className="h-[196px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={checkData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2236" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#8892A4"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    fontFamily="JetBrains Mono, monospace"
                  />
                  <YAxis
                    stroke="#8892A4"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    fontFamily="JetBrains Mono, monospace"
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="safe"    stackId="s" fill="#22C55E" name="Safe"    radius={[0, 0, 2, 2]} />
                  <Bar dataKey="warning" stackId="s" fill="#F59E0B" name="Warning" />
                  <Bar dataKey="unsafe"  stackId="s" fill="#EF4444" name="Unsafe"  radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Latest Rollback Check */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-[14px] font-semibold text-foreground mb-0.5">Latest Rollback Check</h2>
              <p className="text-[12px] text-muted-foreground">Most recently analyzed release</p>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Project</p>
                <div className="flex items-center gap-2">
                  <FolderGit2 size={13} className="text-muted-foreground/60" />
                  <span className="text-[14px] font-semibold font-mono text-foreground">payment-service</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Current (V1)</p>
                  <span className="text-[13px] font-mono font-medium text-foreground">v2.3.0</span>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Incoming (V2)</p>
                  <span className="text-[13px] font-mono font-medium text-amber-400">v2.4.0</span>
                </div>
              </div>

              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Rollback Status</p>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-red-400/10 text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  UNSAFE
                </span>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-[11px] text-muted-foreground mb-1.5">Issue</p>
                <p className="text-[12px] text-foreground/80 font-mono">
                  V1 cannot interpret <span className="text-red-400">REFUNDED_PENDING</span> written by V2
                </p>
              </div>
            </div>

            <Link
              to="/projects/payment-service/report"
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-md border border-border text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-colors"
            >
              View Report
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-[1fr_340px] gap-4">

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-[14px] font-semibold text-foreground mb-5">Recent Activity</h2>
            <div className="relative">
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-5">
                {RECENT_CHECKS.map((item, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="relative z-10 shrink-0 w-[11px] h-[11px] mt-[3px] rounded-full border border-border bg-card flex items-center justify-center">
                      <span className={clsx('w-1.5 h-1.5 rounded-full', ACTIVITY_DOT[item.status] ?? 'bg-slate-500')} />
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[13px] font-medium text-foreground leading-snug">{item.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-mono text-muted-foreground/60">{item.service}</span>
                            <span className="text-[11px] font-mono text-muted-foreground/40">·</span>
                            <span className="text-[11px] font-mono text-muted-foreground/60">{item.detail}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground/50 shrink-0">{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col gap-4">
            <h2 className="text-[14px] font-semibold text-foreground">Quick Actions</h2>
            <div className="space-y-2 flex-1">
              <Link
                to="/projects/payment-service/change-analysis"
                className="flex items-center justify-between w-full px-3 py-3 rounded-md border border-border hover:bg-white/[0.03] hover:border-primary/30 transition-colors group"
              >
                <span className="flex items-center gap-2 text-[13px] font-medium">
                  <GitCompare size={13} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  Analyze payment-service v2.4.0
                </span>
                <ArrowUpRight size={13} className="text-muted-foreground/40" />
              </Link>
              <Link
                to="/projects/payment-service/rehearsal"
                className="flex items-center justify-between w-full px-3 py-3 rounded-md border border-border hover:bg-white/[0.03] transition-colors group"
              >
                <span className="flex items-center gap-2 text-[13px] font-medium">
                  <FlaskConical size={13} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  View Active Rehearsal
                </span>
                <ArrowUpRight size={13} className="text-muted-foreground/40" />
              </Link>
              <Link
                to="/check-history"
                className="flex items-center justify-between w-full px-3 py-3 rounded-md border border-border hover:bg-white/[0.03] transition-colors group"
              >
                <span className="flex items-center gap-2 text-[13px] font-medium">
                  <CheckCircle2 size={13} className="text-muted-foreground" />
                  View All Check History
                </span>
                <ArrowUpRight size={13} className="text-muted-foreground/40" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  context,
  contextColor = 'text-muted-foreground',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  context: string;
  contextColor?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg px-5 py-4 hover:border-border/80 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
        <span className="text-muted-foreground/30">{icon}</span>
      </div>
      <p className="font-mono text-[32px] font-semibold leading-none text-foreground">{value}</p>
      <p className={clsx('text-[11px] mt-2', contextColor)}>{context}</p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={clsx('w-2 h-2 rounded-sm shrink-0', color)} />
      {label}
    </span>
  );
}
